import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import { Chain, Notification, User } from '../entities';
import { REPOSITORY_INTERFACE } from '../module.config';
import { IGeneralRepository, IUserRepository } from '../repositories';
import { INotificationRepository } from '../repositories/inotification.repository';
import { ConfigService } from '../shared/services/config.service';
import { IndexerClient } from '../utils/apis/IndexerClient';
import { Queue } from './queue';

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
    const usersQueue = new Queue<User[]>();

    // Get all supported chains
    const supportedChains: Chain[] = await this.chainRepo.findAll();

    // Get proposals in voting period
    const inVotingProposal = await this.getInVotingProposals(supportedChains);
    if (inVotingProposal.length === 0) return;

    // Get all users
    let skip = 0;
    const limit = 50;
    const users: User[] = await this.userRepo.getUsers(limit, skip);
    if (users.length === 0) return;

    usersQueue.enqueue(users);

    // Make notification templates
    const templates = this.buildTemplateNotifications(
      inVotingProposal,
      supportedChains,
    );

    // Send notifications to users
    while (!usersQueue.isEmpty()) {
      const users = usersQueue.dequeue();
      if (users) {
        await this.sendNotificationToUser(users, templates);

        skip += limit;
        const anotherUsers = await this.userRepo.getUsers(limit, skip);
        if (anotherUsers.length > 0) {
          usersQueue.enqueue(anotherUsers);
        }
      }
    }
  }

  /**
   *
   * @param inVotingProposal
   * @param supportedChains
   * @returns
   */
  buildTemplateNotifications(
    inVotingProposal: any[],
    supportedChains: Chain[],
  ): Notification[] {
    return inVotingProposal.map((proposal) => {
      return Notification.newProposalNotification(
        Number(proposal.proposal_id),
        proposal.content.title,
        proposal.voting_end_time,
        supportedChains.find(
          (chain) => chain.chainId === proposal.custom_info.chain_id,
        ).id,
      );
    });
  }

  /**
   *
   * @param users
   * @param templates
   */
  async sendNotificationToUser(users: User[], templates: Notification[]) {
    // Notify to all users
    const promises = [];
    templates.forEach((template) => {
      const notifications = users.map((user) => {
        const newNotification = Object.assign({}, template);
        newNotification.userId = user.id;
        return plainToInstance(Notification, newNotification);
      });

      // Save notifications to DB
      promises.push(this.notificationRepo.create(notifications));
    });

    const result = await Promise.all(promises);

    for (const notifications of result) {
      this._logger.log(
        `[Chain #${notifications[0].internalChainId} - Proposal #${notifications[0].proposalNumber}] Send ${notifications.length} notifications to ${users.length} users successfully!`,
      );
    }
  }

  /**
   *
   * @param supportedChains
   * @returns
   */
  async getInVotingProposals(supportedChains: Chain[]) {
    const currentTime = new Date();

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
    return inVotingProposal;
  }
}
