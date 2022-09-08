import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';

import { AuthDto, UpdatePasswordDto } from './auth.dto';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() data: AuthDto) {
    return this.authService.login(data);
  }

  @Post('activate')
  async activate(@Body() data: { link: string }) {
    return this.authService.activateUser(data.link);
  }

  @Post('reactivate')
  async reactivate(@Body() data: { email: string }) {
    return this.authService.reactivate(data.email);
  }

  @Post('restore-password')
  async restorePassword(@Body() data: { email: string }) {
    return this.authService.restorePassword(data.email);
  }

  @Post('refresh')
  async refreshToken(@Body() data: { refreshToken: string; userHash: string }) {
    return this.authService.refreshToken(data);
  }

  @Post('validate-restore-code')
  async validateRestoreCode(@Body() data: { code: string }) {
    return this.authService.validateRestoreCode(data.code);
  }

  @Post('update-password')
  async updatePassword(@Body() data: UpdatePasswordDto) {
    return this.authService.updatePassword(data);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Body() data: { refreshToken: string }) {
    return this.authService.logout(data.refreshToken);
  }
}
