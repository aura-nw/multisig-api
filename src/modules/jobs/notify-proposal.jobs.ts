import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import { ChainRepository } from '../chain/chain.repository';
import { UserRepository } from '../user/user.repository';
import { Chain } from '../chain/entities/chain.entity';
import { Notification } from '../notification/entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { IndexerClient } from '../../shared/services/indexer.service';
import { NotificationRepository } from '../notification/notification.repository';
import { IProposal } from '../../interfaces';

@Injectable()
export class NotifyProposalJob {
  private readonly logger = new Logger(NotifyProposalJob.name);

  constructor(
    private indexer: IndexerClient,
    private readonly userRepo: UserRepository,
    private readonly chainRepo: ChainRepository,
    private readonly notifyRepo: NotificationRepository,
  ) {
    this.logger.log(
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
      supportedChains.map((chain) =>
        this.indexer.getProposalsByChainId(chain.chainId),
      ),
    );

    // Get proposal in voting period
    const inVotingProposal: IProposal[] = [];
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
    // Must get 1000 users/batch
    const users: User[] = await this.userRepo.getAllUser();

    // Make notification templates
    const templates = inVotingProposal.map((proposal) =>
      // Create template notification
      Notification.newProposalNotification(
        Number(proposal.proposal_id),
        proposal.content.title,
        new Date(proposal.voting_end_time),
        supportedChains.find(
          (chain) => chain.chainId === proposal.custom_info.chain_id,
        ).id,
      ),
    );

    // Must send a notification to the safe owner by a chain instead of reporting to all user
    // Notify to all users
    const promises = templates.map((template) => {
      const notifications = users.map((user) => {
        const newNotification = { ...template };
        newNotification.userId = user.id;
        return plainToInstance(Notification, newNotification);
      });

      // Save notifications to DB
      return this.notifyRepo.saveNotification(notifications);
    });

    await Promise.all(promises);
    this.logger.log(
      `Notified proposal ${templates.map((t) => t.id).toString()} to ${
        users.length
      } users successfully!`,
    );
  }
}
