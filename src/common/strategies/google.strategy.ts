/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {
  Strategy,
  VerifyCallback,
  StrategyOptions,
} from 'passport-google-oauth20';
import { config } from 'src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    done(null, profile);
  }
}
