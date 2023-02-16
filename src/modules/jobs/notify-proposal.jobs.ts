import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import { ChainRepository } from '../chain/chain.repository';
import { NotificationRepository } from '../notification/notification.repository';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '../../shared/services/config.service';
import { IndexerClient } from '../../utils/apis/indexer-client.service';
import { Chain } from '../chain/entities/chain.entity';
import { Notification } from '../notification/entities/notification.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotifyProposalJob {
  private readonly _logger = new Logger(NotifyProposalJob.name);
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));

  constructor(
    private configService: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly chainRepo: ChainRepository,
    private readonly notificationRepo: NotificationRepository,
  ) {
    this._logger.log(
      '============== Constructor Notify Proposal Job ==============',
    );
  }

  @Cron('0 0 0 * * *')
  async handleCron() {
    const currentTime = new Date();
    // Get all supported chains
    const supportedChains: Chain[] = await this.chainRepo.showNetworkList();

    // Get latest proposal
    const latestProposals = await Promise.all(
      supportedChains.map((chain) => {
        return this._indexer.getProposalsByChainId(chain.chainId);
      }),
    );

    // Get proposal in voting period
    const inVotingProposal = [];
    latestProposals.forEach((proposals) => {
      inVotingProposal.push(
        ...proposals.filter(
          (proposal) =>
            new Date(proposal.voting_start_time) < currentTime &&
            new Date(proposal.voting_end_time) > currentTime,
        ),
      );
    });
    if (inVotingProposal.length === 0) return;

    // Get all users
    // TODO: Get 1000 users/batch
    const users: User[] = await this.userRepo.getAllUser();

    // Make notification templates
    const templates = inVotingProposal.map((proposal) => {
      // Create template notification
      return Notification.newProposalNotification(
        Number(proposal.proposal_id),
        proposal.content.title,
        proposal.voting_end_time,
        supportedChains.find(
          (chain) => chain.chainId === proposal.custom_info.chain_id,
        ).id,
      );
    });

    // TODO: send a notification to the safe owner by a chain instead of reporting to all user
    // Notify to all users
    templates.forEach(async (template) => {
      const notifications = users.map((user) => {
        const newNotification = Object.assign({}, template);
        newNotification.userId = user.id;
        return plainToInstance(Notification, newNotification);
      });

      // Save notifications to DB
      const result = await this.notificationRepo.saveNotification(
        notifications,
      );
      this._logger.log(
        `Notified proposal ${template.proposalNumber} to ${result.length} users successfully!`,
      );
    });
  }
}
