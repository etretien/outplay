import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { EncryptionService } from '../core/encryption/encryption';
import { AuthService } from './auth.service';
import { MailingService } from '../core/mailing/mailing';

import { AuthDto, RegisterDTO } from './auth.dto';
import { STATUS } from '../user/user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
    private mailService: MailingService,
  ) {}

  private async generateTokens(sub: number, login: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub,
        login,
      },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: 60 * 15 },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub,
        login,
      },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: 60 * 60 * 24 * 7 },
    );

    return { accessToken, refreshToken };
  }

  private generateActivationLetter(link) {
    return {
      html:
        "<h1>Hello!</h1><p>Please, click the link below to activate your account.</p><a href='" +
        link +
        "'>ACTIVATE</a>",
      text:
        'Hello! Please, copy and past the following ling into you browser to activate your account:\n' +
        link,
    };
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
      const { html, text } = this.generateActivationLetter(activationLink);
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

    const tokens = await this.generateTokens(user.id, user.email);
    const refreshHash = await this.encryptionService.hashData(
      tokens.refreshToken,
    );
    const accessHash = await this.encryptionService.hashData(
      tokens.accessToken,
    );
    await this.authService.updateRefreshToken(user.id, refreshHash);
    return {
      id: user.id,
      email: user.email,
      refreshToken: refreshHash,
      accessToken: accessHash,
    };
  }

  @Post('activate')
  async activate(@Body() data: { link: string }) {
    const decoded = this.jwtService.decode(data.link);
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
        'Cannot activate account. User is deleted',
        HttpStatus.BAD_REQUEST,
      );

    const success = await this.authService.activateUser(user.id);
    return { success };
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

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshToken(
    @Req() req: Request & { user: { sub: number; refreshToken: string } },
  ) {
    const { user } = req;
    const userFromDb = await this.authService.getUserById(user.sub);
    if (!userFromDb)
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);

    const isValidToken = await this.encryptionService.compare(
      user.refreshToken,
      userFromDb.refreshToken,
    );
    if (!isValidToken)
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);

    const tokens = await this.generateTokens(userFromDb.id, userFromDb.email);
    const refreshHash = await this.encryptionService.hashData(
      tokens.refreshToken,
    );
    const accessHash = await this.encryptionService.hashData(
        tokens.accessToken,
    );
    await this.authService.updateRefreshToken(user.sub, refreshHash);
    return {
      id: userFromDb.id,
      email: userFromDb.login,
      ...tokens,
    };
  }*/
}
