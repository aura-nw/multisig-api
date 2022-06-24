import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SERVICE_INTERFACE } from './module.config';
import { IAuthService } from './services/iauth.service';
import { ConfigService } from 'src/shared/services/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public readonly _logger = new Logger(JwtStrategy.name);
  constructor(
    private configService: ConfigService,
    @Inject(SERVICE_INTERFACE.IAUTH_SERVICE) private authService: IAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      const data = payload.data;
      const timestampExpire = new Date(
        Number(data) +
          1000 *
            Number(this.configService.get('JWT_EXPIRATION').match(/\d+/g)[0]),
      );
      const currentTimestamp = new Date();
      if (currentTimestamp > timestampExpire) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      return true;
    } catch (error) {
      this._logger.error(error);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
