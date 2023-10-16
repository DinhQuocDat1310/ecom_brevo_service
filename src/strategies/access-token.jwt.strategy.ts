import { BrevoService } from './../brevo/brevo.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PayloadDTO } from '../brevo/dto/bravo';

@Injectable()
export class AccessTokenJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(private readonly brevoService: BrevoService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_JWT_SECRET_KEY,
    });
  }

  async validate(payload: PayloadDTO) {
    const user = await this.brevoService.getUserByEmailorPhonenumber(
      payload.username,
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
