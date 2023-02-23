import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import {
  CommonService,
  CustomConfigService,
  IndexerClient,
  LcdClient,
} from './services';

const providers = [
  CustomConfigService,
  IndexerClient,
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
