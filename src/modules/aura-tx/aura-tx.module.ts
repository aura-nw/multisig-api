import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuraTxRepository } from './aura-tx.repository';
import { AuraTx } from './entities/aura-tx.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuraTx])],
  controllers: [],
  providers: [AuraTxRepository],
  exports: [AuraTxRepository],
})
export class AuraTxModule {}
