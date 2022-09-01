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

  async createUser(data: AuthDto & { activationLink: string }) {
    const userExists = await this.userRepository.findOneBy({
      email: data.email,
    });
    if (userExists) {
      return undefined;
    }

    const user = new UserEntity();
    const newUser = {
      ...user,
      ...data,
    };
    return this.userRepository.save(newUser);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
      select: ['id', 'email', 'password', 'status'],
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

  async getUserByLink(email: string, activationLink: string) {
    return this.userRepository.findOne({
      where: {
        email,
        activationLink,
      },
      select: ['id', 'status'],
    });
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

  /*

  async getUserById(id: number) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'login', 'password', 'refreshToken'],
    });
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
  }*/
}
