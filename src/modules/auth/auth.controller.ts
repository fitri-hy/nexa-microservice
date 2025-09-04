import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    if (!loginDto.username || !loginDto.password) {
      throw new BadRequestException('Username and password are required');
    }
    return this.authService.login(loginDto);
  }
}
