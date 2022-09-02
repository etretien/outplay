import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { EncryptionService } from '../core/encryption/encryption';
import { AuthService } from './auth.service';
import { MailingService } from '../core/mailing/mailing';

import { AuthDto, RegisterDTO } from './auth.dto';
import { STATUS } from '../user/user.dto';

import { generateActivationLetter } from '../core/helpers/mailing';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
    private mailService: MailingService,
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

  @Post('register')
  async register(@Body() data: RegisterDTO) {
    const hashedPassword = await this.encryptionService.hashData(data.password);
    const link = uuidv4();
    const activationLink = await this.jwtService.signAsync(
      {
        sub: link,
        email: data.email,
      },
      { secret: process.env.JWT_REFRESH_SECRET },
    );

    const user = await this.authService.createUser({
      ...data,
      password: hashedPassword,
      activationLink,
    });
    if (!user)
      throw new HttpException(
        'User with such email already exists',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const { html, text } = generateActivationLetter(activationLink);
      const message = await this.mailService.sendEmail(
        data.email,
        'Outplay: activation letter',
        html,
        text,
      );
      return { success: !!message.messageId, activationLink };
    } catch (e) {
      return { success: false, error: e, activationLink };
    }
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
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('activate')
  async activate(@Body() data: { link: string }) {
    const decoded = this.jwtService.decode(data.link);
    if (!decoded || !(decoded as { [field: string]: string }).email)
      throw new HttpException(
        'Activation link is not valid',
        HttpStatus.BAD_REQUEST,
      );
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

  @Post('refresh')
  async refreshToken(@Body() data: { refreshToken: string; userHash: string }) {
    const decoded = this.jwtService.decode(data.refreshToken);
    if (!decoded || !(decoded as { [field: string]: string }).email)
      throw new HttpException(
        'Forbidden. Could not refresh token',
        HttpStatus.FORBIDDEN,
      );

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

    const tokens = await this.generateTokens(userFromDb.id, userFromDb.email);
    await this.authService.updateRefreshToken(
      userFromDb.id,
      tokens.refreshToken,
    );
    delete userFromDb.refreshToken;
    delete userFromDb.password;
    return {
      user: userFromDb,
      ...tokens,
    };
  }

  /*@UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Req() req: Request & { user: { sub: number } }) {
    const { user } = req;
    const result = await this.authService.destroyToken(user.sub);
    if (!result)
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);
    return { success: true };
  }


  }*/
}
