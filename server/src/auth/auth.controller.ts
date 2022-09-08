import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

import { EncryptionService } from '../core/encryption/encryption';
import { AuthService } from './auth.service';
import { MailingService } from '../core/mailing/mailing';

import { AuthDto, UpdatePasswordDto } from './auth.dto';
import { STATUS } from '../user/user.dto';

import { AccessTokenGuard } from '../core/guards/access-token.guard';
import {
  generateActivationLetter,
  generateRestoreLetter,
} from '../core/helpers/mailing';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
    private mailingService: MailingService,
  ) {}

  private async generateTokens(sub: number, email: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub,
        email,
      },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '5m' },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub,
        email,
      },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '15m' },
    );

    return { accessToken, refreshToken };
  }

  private decodeToken(token: string) {
    const decoded = this.jwtService.decode(token);
    if (!decoded || !(decoded as { [field: string]: string }).email)
      throw new HttpException(
        'Forbidden. Could not refresh token',
        HttpStatus.FORBIDDEN,
      );
    return decoded;
  }

  @Post('login')
  async login(@Body() data: AuthDto) {
    const user = await this.authService.getUserByEmail(data.email);
    if (!user)
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);

    const isPassEqual = await this.encryptionService.compare(
      data.password,
      user.password,
    );
    if (!isPassEqual)
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);

    if (user.status === STATUS.NOT_ACTIVE)
      throw new HttpException('Account is not active', HttpStatus.FORBIDDEN);

    if (user.status === STATUS.DELETED)
      throw new HttpException('Account is deleted', HttpStatus.FORBIDDEN);

    const { refreshToken, accessToken } = await this.generateTokens(
      user.id,
      user.email,
    );
    await this.authService.updateRefreshToken(user.id, refreshToken);
    delete user.password;
    delete user.restoreLink;
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('activate')
  async activate(@Body() data: { link: string }) {
    const decoded = this.decodeToken(data.link);
    const user = await this.authService.getUserByLink(
      (decoded as { [field: string]: string }).email,
      data.link,
    );
    if (!user)
      throw new HttpException(
        'Activation link is not valid',
        HttpStatus.BAD_REQUEST,
      );
    if (user.status === STATUS.ACTIVE)
      throw new HttpException(
        'Account is already active',
        HttpStatus.BAD_REQUEST,
      );
    if (user.status === STATUS.DELETED)
      throw new HttpException(
        'Cannot activate account. Account is deleted',
        HttpStatus.BAD_REQUEST,
      );

    const success = await this.authService.activateUser(user.id);
    return { success };
  }

  @Post('reactivate')
  async reactivate(@Body() data: { email: string }) {
    const user = await this.authService.getUserByEmail(data.email);
    if (!user)
      throw new HttpException('Email was not found', HttpStatus.BAD_REQUEST);

    try {
      const { html, text } = generateActivationLetter(user.activationLink);
      const message = await this.mailingService.sendEmail(
        data.email,
        'Outplay: activation letter',
        html,
        text,
      );
      return {
        success: !!message.messageId,
        activationLink: user.activationLink,
      };
    } catch (e) {
      return { success: false, error: e, activationLink: user.activationLink };
    }
  }

  @Post('restore-password')
  async restorePassword(@Body() data: { email: string }) {
    const user = await this.authService.getUserByEmail(data.email);
    if (!user)
      throw new HttpException('Email is not found', HttpStatus.BAD_REQUEST);

    if (user.status === STATUS.DELETED)
      throw new HttpException(
        'Cannot restore password. Account is deleted',
        HttpStatus.BAD_REQUEST,
      );

    if (user.status === STATUS.NOT_ACTIVE)
      throw new HttpException(
        'Cannot restore password. Account is not activated',
        HttpStatus.BAD_REQUEST,
      );

    const link = uuidv4();
    const restoreLink = await this.jwtService.signAsync(
      {
        sub: link,
        email: data.email,
      },
      { secret: process.env.JWT_REFRESH_SECRET },
    );

    const success = await this.authService.restorePassword(
      user.id,
      restoreLink,
    );
    if (!success) {
      throw new HttpException(
        'Cannot restore password',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const { html, text } = generateRestoreLetter(restoreLink);
      const message = await this.mailingService.sendEmail(
        data.email,
        'Outplay: restore password',
        html,
        text,
      );
      return { success: !!message.messageId, restoreLink };
    } catch (e) {
      return { success: false, error: e, restoreLink };
    }
  }

  @Post('refresh')
  async refreshToken(@Body() data: { refreshToken: string; userHash: string }) {
    const decoded = this.decodeToken(data.refreshToken);

    const userFromDb = await this.authService.getUserById(decoded.sub);
    if (!userFromDb || userFromDb.refreshToken !== data.refreshToken)
      throw new HttpException(
        'Forbidden. Could not refresh token',
        HttpStatus.FORBIDDEN,
      );

    const emailsEqual = await this.encryptionService.compare(
      userFromDb.email.split('@')[0],
      data.userHash,
    );
    if (!emailsEqual)
      throw new HttpException(
        'Forbidden. Could not refresh token',
        HttpStatus.FORBIDDEN,
      );

    const isValidToken = await this.jwtService.verify(data.refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    if (!isValidToken)
      throw new HttpException(
        'Forbidden. Could not refresh token',
        HttpStatus.FORBIDDEN,
      );

    const tokens = await this.generateTokens(userFromDb.id, userFromDb.email);
    await this.authService.updateRefreshToken(
      userFromDb.id,
      tokens.refreshToken,
    );
    delete userFromDb.refreshToken;
    delete userFromDb.password;
    delete userFromDb.restoreLink;
    return {
      user: userFromDb,
      ...tokens,
    };
  }

  @Post('validate-restore-code')
  async validateRestoreCode(@Body() data: { code: string }) {
    const decoded = this.decodeToken(data.code);
    const isValidToken = await this.jwtService.verify(data.code, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    if (!isValidToken)
      throw new HttpException(
        'Forbidden. Code is invalid',
        HttpStatus.BAD_REQUEST,
      );

    return this.authService.validateRestoreCode(
      (decoded as { [field: string]: string }).email,
      data.code,
    );
  }

  @Post('update-password')
  async updatePassword(@Body() data: UpdatePasswordDto) {
    const decoded = this.decodeToken(data.restoreCode);
    const isValidToken = await this.jwtService.verify(data.restoreCode, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    if (!isValidToken)
      throw new HttpException(
        'Forbidden. Code is invalid',
        HttpStatus.BAD_REQUEST,
      );

    const validated = await this.authService.validateRestoreCode(
      (decoded as { [field: string]: string }).email,
      data.restoreCode,
    );
    const hashedPassword = await this.encryptionService.hashData(data.password);
    return this.authService.updatePassword(validated.id, hashedPassword);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Body() data: { refreshToken: string }) {
    const decoded = this.decodeToken(data.refreshToken);
    const result = await this.authService.destroyToken(decoded.sub);
    if (!result)
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);
    return { success: true };
  }
}
