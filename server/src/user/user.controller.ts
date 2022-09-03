import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

import { UserService } from './user.service';
import { EncryptionService } from '../core/encryption/encryption';
import { MailingService } from '../core/mailing/mailing';

import { UserPatchDto, UserPatchAvatarDto, UserPostDto } from './user.dto';

import { generateActivationLetter } from '../core/helpers/mailing';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private encryptionService: EncryptionService,
    private jwtService: JwtService,
    private mailingService: MailingService,
  ) {}

  @Post()
  async createUser(@Body() data: UserPostDto) {
    const hashedPassword = await this.encryptionService.hashData(data.password);
    const link = uuidv4();
    const activationLink = await this.jwtService.signAsync(
      {
        sub: link,
        email: data.email,
      },
      { secret: process.env.JWT_REFRESH_SECRET },
    );

    const user = await this.userService.createUser({
      ...data,
      password: hashedPassword,
      activationLink,
    });
    if (!user)
      throw new HttpException(
        'User with such email already exists',
        HttpStatus.BAD_REQUEST,
      );
    if ((user as unknown as { error: true }).error)
      throw new HttpException(
        'Too many attempts to create account',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const { html, text } = generateActivationLetter(activationLink);
      const message = await this.mailingService.sendEmail(
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

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() data: UserPatchDto | UserPatchAvatarDto,
  ) {
    if ((data as UserPatchAvatarDto).avatar) {
      return this.userService.updateAvatar(
        (data as UserPatchAvatarDto).avatar,
        (data as UserPatchAvatarDto).avatarType,
        id,
      );
    }
    const updatedUser = await this.userService.updateUser(
      id,
      data as UserPatchDto,
    );
    return updatedUser || undefined;
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async getUsers(@Query() query: Record<string, string>) {
    const limit = query.limit ? +query.limit : 10;
    const offset = query.offset ? +query.offset : 0;
    const { users, total } = await this.userService.getUsers(limit, offset);
    return {
      users,
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }

  /*

    @UseGuards(AccessTokenGuard)
    @Delete(':id')
    async softDeleteUser(@Param('id') id: number) {
        const result = await this.userService.softDeleteUser(id);
        return result ? { success: true } : undefined;
    }

    @UseGuards(AccessTokenGuard)
    @Get(':id')
    async getUserById(@Param('id') id: number) {
        const result = await this.userService.getUserById(id);
        return result || undefined;
    }

    */
}
