import { Module } from '@nestjs/common';
import { ChainModule } from '../modules/chain/chain.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { UserModule } from '../modules/user/user.module';
import { NotifyProposalJob } from './notify-proposal.jobs';

@Module({
  imports: [UserModule, ChainModule, NotificationModule],
  providers: [NotifyProposalJob],
})
export class NotifyProposalModule {}
