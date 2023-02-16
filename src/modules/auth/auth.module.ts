import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ChainModule } from '../chain/chain.module';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../../shared/shared.module';
import { ConfigService } from '../../shared/services/config.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => configService.jwtConfig,
      inject: [ConfigService],
    }),
    ChainModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
