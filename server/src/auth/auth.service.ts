import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import UserEntity from '../user/user.entity';

import { AuthDto } from './auth.dto';
import { STATUS } from '../user/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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

  async getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
      select: [
        'id',
        'email',
        'password',
        'status',
        'balance',
        ...this.commonFields,
      ],
      relations: {
        avatar: true,
      },
    });
  }

  async getUserByLink(email: string, activationLink: string) {
    return this.userRepository.findOne({
      where: {
        email,
        activationLink,
      },
      select: ['id', 'status'],
    });
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'email', 'password', 'refreshToken', ...this.commonFields],
      relations: {
        avatar: true,
      },
    });
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

  async activateUser(id: number) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (userToUpdate) {
      const newUser = {
        ...userToUpdate,
        status: STATUS.ACTIVE,
      };
      await this.userRepository.save(newUser);
      return true;
    }
    return false;
  }

  async destroyToken(id: number) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (userToUpdate) {
      const newUser = {
        ...userToUpdate,
        refreshToken: null,
      };
      return this.userRepository.save(newUser);
    }
    return undefined;
  }
}
