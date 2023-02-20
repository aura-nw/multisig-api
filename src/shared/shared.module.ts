import { Module, Global } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { IndexerClient } from './services/indexer.service';
const providers = [ConfigService, IndexerClient];

@Global()
@Module({
  imports: [],
  providers: [...providers],
  exports: [...providers],
})
export class SharedModule {}
