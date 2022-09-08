import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import UserEntity from '../user/user.entity';

import { STATUS } from '../user/user.dto';
import { generateActivationLetter } from '../core/helpers/mailing';

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
        'restoreLink',
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
      select: [
        'id',
        'email',
        'password',
        'refreshToken',
        'restoreLink',
        ...this.commonFields,
      ],
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

  async restorePassword(id: number, restoreLink: string) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (userToUpdate) {
      const newUser = {
        ...userToUpdate,
        restoreLink,
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

  async validateRestoreCode(email: string, code: string) {
    const userFromDb = await this.getUserByEmail(email);
    if (!userFromDb || userFromDb.restoreLink !== code)
      throw new HttpException(
        'Forbidden. Code is invalid',
        HttpStatus.BAD_REQUEST,
      );

    return { code, id: userFromDb.id };
  }

  async updatePassword(id: number, password: string) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (userToUpdate) {
      userToUpdate.password = password;
      userToUpdate.restoreLink = null;
      await this.userRepository.save(userToUpdate);
      return { success: true };
    }
    return undefined;
  }
}
