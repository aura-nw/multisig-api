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
import { Queue } from './queue';
import { IndexerV2Client } from '../../shared/services/indexer-v2.service';

@Injectable()
export class NotifyProposalJob {
  private readonly logger = new Logger(NotifyProposalJob.name);

  constructor(
    private indexer: IndexerClient,
    private indexerV2: IndexerV2Client,
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
    const usersQueue = new Queue<User[]>();

    // Get all supported chains
    const supportedChains: Chain[] = await this.chainRepo.showNetworkList();

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
      const usersInQueue = usersQueue.dequeue();
      if (usersInQueue) {
        // eslint-disable-next-line no-await-in-loop
        await this.sendNotificationToUser(usersInQueue, templates);

        skip += limit;
        // eslint-disable-next-line no-await-in-loop
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
    inVotingProposal: IProposal[],
    supportedChains: Chain[],
  ): Notification[] {
    return inVotingProposal.map((proposal) =>
      Notification.newProposalNotification(
        Number(proposal.proposal_id),
        proposal.content.title,
        new Date(proposal.voting_end_time),
        supportedChains.find(
          (chain) => chain.chainId === proposal.custom_info.chain_id,
        ).id,
      ),
    );
  }

  /**
   *
   * @param users
   * @param templates
   */
  async sendNotificationToUser(users: User[], templates: Notification[]) {
    // Notify to all users
    const promises: Promise<Notification[]>[] = [];
    templates.forEach((template) => {
      const notifications = users.map((user) => {
        const newNotification = { ...template };
        newNotification.userId = user.id;
        return plainToInstance(Notification, newNotification);
      });

      // Save notifications to DB
      promises.push(this.notifyRepo.saveNotification(notifications));
    });

    const result = await Promise.all(promises);

    for (const notifications of result) {
      this.logger.log(
        `[Chain #${notifications[0].internalChainId} - Proposal #${notifications[0].proposalNumber}] Send ${notifications.length} notifications to ${users.length} users successfully!`,
      );
    }
  }

  /**
   *
   * @param supportedChains
   * @returns
   */
  async getInVotingProposals(supportedChains: Chain[]): Promise<IProposal[]> {
    const currentTime = new Date();

    // Get latest proposal
    const latestProposals = await Promise.all(
      supportedChains.map((chain) =>
        // this.indexer.getProposalsByChainId(chain.chainId),
        this.indexerV2.getProposals(chain.chainId),
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
    return inVotingProposal;
  }
}
