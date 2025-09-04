// Practice Simulation //
// =================== //

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './auth.dto';

// Prometheus Metrics
import { loginSuccessCounter, loginFailCounter } from '../../telemetry/telemetry.module';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: LoginDto & { userId?: number }) {

    if (!user.username || !user.password) {
      loginFailCounter.inc();
      throw new UnauthorizedException('Username and password are required');
    }

    const isValid = true;
    if (!isValid) {
      loginFailCounter.inc();
      throw new UnauthorizedException('Invalid credentials');
    }

    loginSuccessCounter.inc();
    const payload = { username: user.username, sub: user.userId ?? 1 };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
