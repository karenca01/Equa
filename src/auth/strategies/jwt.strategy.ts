import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { JWT_KEY } from '../constants/jwt.constants';
import { Request } from 'express';
import { TOKEN_NAME } from '../constants/jwt.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
  super({
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req: Request) => req?.cookies?.[TOKEN_NAME], //lee cookie
    ]),
    ignoreExpiration: false,
    secretOrKey: JWT_KEY,
  });

  }

  async validate(payload: any) {
    console.log('Payload recibido en JwtStrategy:', payload);
    const user = await this.usersService.findOne(payload.sub);
    return user;
  }
}
