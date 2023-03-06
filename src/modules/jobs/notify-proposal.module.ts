import { Module } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { NotifyProposalJob } from './notify-proposal.jobs';

@Module({
  imports: [UserModule, ChainModule, NotificationModule],
  providers: [NotifyProposalJob],
})
export class NotifyProposalModule {}
