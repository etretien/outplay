import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';

import UserEntity from './user.entity';
import AvatarEntity from '../avatar/avatar.entity';

import { TYPE } from '../avatar/avatar.dto';
import { STATUS, UserPatchDto, UserPostDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AvatarEntity)
    private readonly avatarRepository: Repository<AvatarEntity>,
  ) {}

  async updateAvatar(value: string, type: TYPE, userId: number) {
    const avatar = new AvatarEntity();
    const newAvatar = await this.avatarRepository.save({
      ...avatar,
      type,
      value,
    });
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    await this.userRepository.save({
      ...userToUpdate,
      avatar: newAvatar,
    });
    return newAvatar;
  }

  async createUser(data: UserPostDto & { activationLink: string }) {
    const userExists = await this.userRepository.findOneBy({
      email: data.email,
    });
    if (userExists) {
      return undefined;
    }

    /*const sameVisitor = await this.userRepository.findOne({
      where: { visitorId: data.visitorId },
      select: ['visitorId', 'registrationTime'],
    });
    if (sameVisitor) {
      const diff =
        (performance.now() - Number(sameVisitor.registrationTime)) / 3600000;
      if (diff < 1) return { error: true };
    }*/

    const user = new UserEntity();
    const newUser = {
      ...user,
      ...data,
    };
    return this.userRepository.save(newUser);
  }

  async updateUser(id: number, data: UserPatchDto) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (userToUpdate) {
      const newUser = {
        ...userToUpdate,
        ...data,
      };
      await this.userRepository.save(newUser);
      return { success: true };
    }
    return undefined;
  }

  async getUsers(limit: number, offset: number) {
    const [users, total] = await this.userRepository.findAndCount({
      order: {
        rating: 'ASC',
      },
      where: {
        status: STATUS.ACTIVE,
      },
      skip: offset,
      take: limit,
      relations: {
        avatar: true,
      },
    });
    return { users, total };
  }

  /*

    async softDeleteUser(id: number) {
        const userToDelete = await this.userRepository.findOneBy({
            id,
        });
        if (userToDelete) {
            await this.userRepository.softDelete(id);
            return true;
        }
        return false;
    }

    async getUserById(id: number) {
        const user = await this.userRepository.findOne({
            where: {
                id,
            },
            relations: ['groups'],
        });
        return user ? this.toJson(user) : undefined;
    }

    */
}
