import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

import { UserService } from './user.service';

import { UserPatchDto, UserPatchAvatarDto, UserPostDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUser(@Body() data: UserPostDto) {
    return this.userService.createUser(data);
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
    const country = query.country || '';
    const search = query.searchQuery || '';
    const { users, total } = await this.userService.getUsers(
      limit,
      offset,
      country,
      search,
    );
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
