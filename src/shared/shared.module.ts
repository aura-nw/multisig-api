import { Module, Global } from '@nestjs/common';
import { ConfigService } from './services/config.service';
const providers = [ConfigService];

@Global()
@Module({
  imports: [],
  providers: [...providers],
  exports: [...providers],
})
export class SharedModule {}
