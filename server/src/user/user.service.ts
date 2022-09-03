import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';

import UserEntity from './user.entity';
import AvatarEntity from '../avatar/avatar.entity';

import { TYPE } from '../avatar/avatar.dto';
import { UserPatchDto, UserPostDto } from './user.dto';

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

    const sameVisitor = await this.userRepository.findOne({
      where: { visitorId: data.visitorId },
      select: ['visitorId', 'registrationTime'],
    });
    if (sameVisitor) {
      const diff =
        (performance.now() - Number(sameVisitor.registrationTime)) / 3600000;
      if (diff < 1) return { error: true };
    }

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

  /*private async toJson(user: UserEntity | UserEntity[]) {
        const groups = await this.groupRepository.find({
            relations: ['permissions', 'users'],
        });
        let data;
        if (Array.isArray(user)) {
            data = user.map((item) => ({
                ...item,
                groups: item.groups.map((group) => group.id),
            }));
        } else {
            data = {
                ...user,
                groups: user.groups.map((group) => group.id),
            };
        }
        return {
            data,
            meta: {
                groups: groups.map((group) => ({
                    name: group.name,
                    id: group.id,
                })),
            },
        };
    }

    async createUser(data: UserPostDto) {
        const userExists = await this.userRepository.findOneBy({
            login: data.login,
        });
        if (userExists) {
            return undefined;
        }

        const groups = await this.groupRepository.find({
            where: {
                id: In(data.groupsIds),
            },
        });
        const user = new UserEntity();
        const newUser = {
            ...user,
            ...data,
            groups,
        };
        await this.userRepository.save(newUser);
        delete newUser.deletedAt;
        delete newUser.password;
        delete newUser.refreshToken;
        return this.toJson(newUser);
    }



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

    async getUsers(login: string, limit: number, offset: number) {
        const [users, total] = await this.userRepository.findAndCount({
            order: {
                login: 'ASC',
            },
            skip: offset,
            take: limit,
            where: {
                login: ILike(`${login}%`),
            },
            relations: ['groups'],
        });
        const json = await this.toJson(users);
        return { ...json, total };
    }*/
}
