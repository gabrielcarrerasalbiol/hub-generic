declare module 'passport-apple' {
  import { Strategy as PassportStrategy } from 'passport';
  
  export interface AppleStrategyOptions {
    clientID: string;
    teamID: string;
    keyID: string;
    privateKeyLocation: string;
    callbackURL: string;
    passReqToCallback?: boolean;
  }
  
  export class Strategy extends PassportStrategy {
    constructor(options: AppleStrategyOptions, verify: Function);
  }
}