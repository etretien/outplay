import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import UserEntity from '../user/user.entity';

import { STATUS } from '../user/user.dto';

import { AuthDto, UpdatePasswordDto } from './auth.dto';

import { EncryptionService } from '../core/encryption/encryption';
import { MailingService } from '../core/mailing/mailing';

import {
  generateActivationLetter,
  generateRestoreLetter,
} from '../core/helpers/mailing';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private encryptionService: EncryptionService,
    private jwtService: JwtService,
    private mailingService: MailingService,
  ) {}

  private readonly commonFields: (keyof UserEntity)[] = [
    'id',
    'balance',
    'about',
    'firstName',
    'lastName',
    'gameLevel',
    'rating',
    'countryCode',
  ];

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

  private decodeToken(token: string): { [field: string]: string } {
    const decoded = this.jwtService.decode(token);
    if (!decoded || !(decoded as { [field: string]: string }).email)
      throw new HttpException(
        'Forbidden. Could not refresh token',
        HttpStatus.FORBIDDEN,
      );
    return decoded as { [field: string]: string };
  }

  private async sendActivationEmail(
    link: string,
    email: string,
    isActivation = true,
  ) {
    try {
      const { html, text } = isActivation
        ? generateActivationLetter(link)
        : generateRestoreLetter(link);
      const message = await this.mailingService.sendEmail(
        email,
        'Outplay: activation letter',
        html,
        text,
      );
      return {
        success: !!message.messageId,
        activationLink: link,
      };
    } catch (e) {
      return { success: false, error: e, activationLink: link };
    }
  }

  async login(data: AuthDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
      select: [
        'id',
        'email',
        'password',
        'status',
        'balance',
        'restoreLink',
        ...this.commonFields,
      ],
      relations: {
        avatar: true,
      },
    });
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
    await this.updateRefreshToken(user.id, refreshToken);
    delete user.password;
    delete user.restoreLink;
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (userToUpdate) {
      const newUser = {
        ...userToUpdate,
        refreshToken,
      };
      return this.userRepository.save(newUser);
    }
    return undefined;
  }

  async activateUser(link: string) {
    const decoded = this.decodeToken(link);
    const user = await this.userRepository.findOne({
      where: {
        email: decoded.email,
        activationLink: link,
      },
      select: ['id', 'status'],
    });
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

    user.status = STATUS.ACTIVE;
    return this.userRepository.save(user);
  }

  async reactivate(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (!user)
      throw new HttpException('Email was not found', HttpStatus.BAD_REQUEST);

    return this.sendActivationEmail(user.activationLink, email);
  }

  async restorePassword(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
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
    user.restoreLink = await this.jwtService.signAsync(
      {
        sub: link,
        email: email,
      },
      { secret: process.env.JWT_REFRESH_SECRET },
    );
    await this.userRepository.save(user);
    return this.sendActivationEmail(link, email, false);
  }

  async refreshToken(data: { refreshToken: string; userHash: string }) {
    const decoded = this.decodeToken(data.refreshToken);

    const userFromDb = await this.userRepository.findOne({
      where: {
        id: +decoded.sub,
      },
      select: ['id', 'email', 'refreshToken', ...this.commonFields],
      relations: {
        avatar: true,
      },
    });
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
    userFromDb.refreshToken = tokens.refreshToken;
    await this.userRepository.save(userFromDb);

    delete userFromDb.refreshToken;

    return {
      user: userFromDb,
      ...tokens,
    };
  }

  async validateRestoreCode(code: string) {
    const decoded = this.decodeToken(code);
    const isValidToken = await this.jwtService.verify(code, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    if (!isValidToken)
      throw new HttpException(
        'Forbidden. Code is invalid',
        HttpStatus.BAD_REQUEST,
      );

    const userFromDb = await this.userRepository.findOne({
      where: {
        email: decoded.email,
      },
      select: ['id', 'restoreLink'],
    });
    if (!userFromDb || userFromDb.restoreLink !== code)
      throw new HttpException(
        'Forbidden. Code is invalid',
        HttpStatus.BAD_REQUEST,
      );

    return { code, id: userFromDb.id };
  }

  async updatePassword(data: UpdatePasswordDto) {
    const isValidToken = await this.jwtService.verify(data.restoreCode, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    if (!isValidToken)
      throw new HttpException(
        'Forbidden. Code is invalid',
        HttpStatus.BAD_REQUEST,
      );

    const validated = await this.validateRestoreCode(data.restoreCode);
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id: validated.id,
      },
    });
    if (userToUpdate) {
      userToUpdate.password = await this.encryptionService.hashData(
        data.password,
      );
      userToUpdate.restoreLink = null;
      await this.userRepository.save(userToUpdate);
      return { success: true };
    }
    return undefined;
  }

  async logout(refreshToken: string) {
    const decoded = this.decodeToken(refreshToken);
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id: +decoded.sub,
      },
    });
    if (userToUpdate) {
      userToUpdate.refreshToken = null;
      return this.userRepository.save(userToUpdate);
    }
    return undefined;
  }
}
