import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import { Chain, Notification, User } from '../entities';
import { REPOSITORY_INTERFACE } from '../module.config';
import { IGeneralRepository, IUserRepository } from '../repositories';
import { INotificationRepository } from '../repositories/inotification.repository';
import { ConfigService } from '../shared/services/config.service';
import { IndexerClient } from '../utils/apis/IndexerClient';

@Injectable()
export class NotifyProposalJob {
  private readonly _logger = new Logger(NotifyProposalJob.name);
  private _indexer = new IndexerClient(this.configService.get('INDEXER_URL'));

  constructor(
    private configService: ConfigService,
    @Inject(REPOSITORY_INTERFACE.IUSER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    @Inject(REPOSITORY_INTERFACE.IGENERAL_REPOSITORY)
    private readonly chainRepo: IGeneralRepository,
    @Inject(REPOSITORY_INTERFACE.INOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
  ) {
    this._logger.log(
      '============== Constructor Notify Proposal Job ==============',
    );
  }

  @Cron('0 0 0 * * *')
  async handleCron() {
    const currentTime = new Date();
    // Get all supported chains
    const supportedChains: Chain[] = await this.chainRepo.findAll();

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
    const users: User[] = await this.userRepo.findAll();

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

    // Must send a notification to the safe owner by a chain instead of reporting to all user
    // Notify to all users
    templates.forEach(async (template) => {
      const notifications = users.map((user) => {
        const newNotification = Object.assign({}, template);
        newNotification.userId = user.id;
        return plainToInstance(Notification, newNotification);
      });

      // Save notifications to DB
      const result = await this.notificationRepo.create(notifications);
      this._logger.log(
        `Notified proposal ${template.proposalNumber} to ${result.length} users successfully!`,
      );
    });
  }
}
