import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import {
  CommonService,
  CustomConfigService,
  IndexerV2Client,
  LcdClient,
} from './services';

const providers = [
  CustomConfigService,
  IndexerV2Client,
  CommonService,
  LcdClient,
];

@Global()
@Module({
  imports: [HttpModule],
  providers: [...providers],
  exports: [...providers],
})
export class SharedModule {}
