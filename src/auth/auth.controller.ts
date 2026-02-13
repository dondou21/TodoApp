import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as registerDto from './dto/register.dto';
import * as loginDto from './dto/login.dto';
// Removed the import of AuthResponse to fix the "Cannot find module" lint error.

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: registerDto.RegisterDto): Promise<any> {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: loginDto.LoginDto): Promise<any> {
    return this.authService.login(body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ success: boolean }> {
    await this.authService.logout();
    return { success: true };
  }
}
