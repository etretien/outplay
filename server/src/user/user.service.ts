import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

import UserEntity from './user.entity';
import AvatarEntity from '../avatar/avatar.entity';

import { TYPE } from '../avatar/avatar.dto';
import { STATUS, UserPatchDto, UserPostDto } from './user.dto';

import { generateActivationLetter } from '../core/helpers/mailing';

import { EncryptionService } from '../core/encryption/encryption';
import { MailingService } from '../core/mailing/mailing';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AvatarEntity)
    private readonly avatarRepository: Repository<AvatarEntity>,
    private encryptionService: EncryptionService,
    private jwtService: JwtService,
    private mailingService: MailingService,
  ) {}

  async updateAvatar(value: string, type: TYPE, userId: number) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!userToUpdate)
      throw new HttpException('No user found', HttpStatus.BAD_REQUEST);

    const avatar = new AvatarEntity();
    const newAvatar = await this.avatarRepository.save({
      ...avatar,
      type,
      value,
    });

    await this.userRepository.save({
      ...userToUpdate,
      avatar: newAvatar,
    });
    return newAvatar;
  }

  async createUser(data: UserPostDto) {
    const hashedPassword = await this.encryptionService.hashData(data.password);
    const link = uuidv4();
    const activationLink = await this.jwtService.signAsync(
      {
        sub: link,
        email: data.email,
      },
      { secret: process.env.JWT_REFRESH_SECRET },
    );

    const userExists = await this.userRepository.findOneBy({
      email: data.email,
    });
    if (userExists) {
      throw new HttpException(
        'User with such email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    /*const sameVisitor = await this.userRepository.findOne({
      where: { visitorId: data.visitorId },
      select: ['visitorId', 'registrationTime'],
    });
    if (sameVisitor) {
      const diff =
        (performance.now() - Number(sameVisitor.registrationTime)) / 3600000;
      if (diff < 1) throw new HttpException(
          'Too many attempts to create account',
          HttpStatus.BAD_REQUEST,
      );
    }*/

    const user = new UserEntity();
    const newUser = {
      ...user,
      ...data,
      password: hashedPassword,
      activationLink,
    };
    await this.userRepository.save(newUser);

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
        rating: 'DESC',
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

  async getUserById(id: number) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        avatar: true,
      },
    });
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
