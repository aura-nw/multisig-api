import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import { CustomConfigService } from './services/config.service';
import { IndexerClient } from './services/indexer.service';

const providers = [CustomConfigService, IndexerClient];

@Global()
@Module({
  imports: [HttpModule],
  providers: [...providers],
  exports: [...providers],
})
export class SharedModule {}
