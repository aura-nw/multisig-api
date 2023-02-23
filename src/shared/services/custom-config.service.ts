import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseType } from '../../common/constants/app.constant';

import { PascalCaseStrategy } from '../pascal-case.strategy';

@Injectable()
export class CustomConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    const entities = [`${__dirname}/../../entities/**/*.entity{.ts,.js}`];
    const migrations = [`${__dirname}/../../migrations/*{.ts,.js}`];

    return {
      entities,
      migrations,
      type: DatabaseType.MYSQL,
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      timezone: 'utc',
      migrationsRun: true,
      connectTimeout: 1000,
      synchronize: false,
      logging: this.nodeEnv === 'development',
      namingStrategy: new PascalCaseStrategy(),
      multipleStatements: true,
      autoLoadEntities: true,
    };
  }

  get jwtConfig(): JwtModuleOptions {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
      },
    };
  }
}
