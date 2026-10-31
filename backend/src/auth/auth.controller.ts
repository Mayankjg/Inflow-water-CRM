import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService, EmailDto, LoginDto, RegisterDto, ResetDto } from './auth.service';
import { Public } from './auth.decorator';
@Controller('auth')
@Public()
export class AuthController {
  constructor(private auth: AuthService) {}
  @Get('status') status() { return this.auth.status(); }
  @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login') @HttpCode(200) login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Post('forgot-password') @HttpCode(200) forgot(@Body() dto: EmailDto) { return this.auth.forgotPassword(dto.email); }
  @Post('reset-password') reset(@Body() dto: ResetDto) { return this.auth.resetPassword(dto); }
}
