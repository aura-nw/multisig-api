import { Module } from '@nestjs/common';
import { SafeOwnerService } from './safe-owner.service';
import { SafeOwnerController } from './safe-owner.controller';
import { SafeOwnerRepository } from './safe-owner.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafeOwner } from './entities/safe-owner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SafeOwner])],
  controllers: [SafeOwnerController],
  providers: [SafeOwnerService, SafeOwnerRepository],
  exports: [SafeOwnerRepository],
})
export class SafeOwnerModule {}
