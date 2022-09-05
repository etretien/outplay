import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TYPE } from '../avatar/avatar.dto';

/*
export class UserPatchAvatarDto {
    @IsOptional()
    @IsString()
    public avatar: string;

    @IsOptional()
    @IsEnum(TYPE, { message: 'Not a valid avatar type' })
    public avatarType: TYPE;
}*/
