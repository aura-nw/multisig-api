import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ChainModule } from '../chain/chain.module';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../../shared/shared.module';
import { CustomConfigService } from '../../shared/services/custom-config.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [SharedModule],
      useFactory: (customConfigService: CustomConfigService) =>
        customConfigService.jwtConfig,
      inject: [CustomConfigService],
    }),
    ChainModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
