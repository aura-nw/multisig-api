import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidatePayloadDto } from './dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: ValidatePayloadDto) {
    try {
      const { data } = payload;
      const timestampExpire = new Date(
        Number(data) +
          1000 *
            Number(
              this.configService.get<string>('JWT_EXPIRATION').match(/\d+/g)[0],
            ),
      );
      const currentTimestamp = new Date();
      if (currentTimestamp > timestampExpire) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      return payload;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
