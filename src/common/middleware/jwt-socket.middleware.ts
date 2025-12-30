/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MySocket } from '../types';
import { IPayload } from '../interface';

@Injectable()
export class JwtSocketMiddleware {
  constructor(private jwtService: JwtService) {}

  use = (client: MySocket, next: (err?: any) => void) => {
    try {
      const auth =
        client.handshake.auth?.token || client.handshake.headers?.authorization;

      if (!auth) {
        return next(new UnauthorizedException('No token provided'));
      }

      const bearer: string = auth.split(' ')[0];
      const token: string = auth.split(' ')[1];
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('Unauthorizated');
      }

      const decoded: IPayload = this.jwtService.verify(token);

      client.user = decoded;

      next();
    } catch (error) {
      console.log('Socket JWT error:', error);
      next(new UnauthorizedException('Unauthorized'));
    }
  };
}
