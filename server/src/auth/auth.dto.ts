import { IsNotEmpty, IsString, IsEmail, IsNumber } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString({ message: 'Email must be string' })
  @IsEmail({ message: 'Not a valid email' })
  email: string;

  @IsNotEmpty()
  @IsString({ message: 'Password must be string' })
  password: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString({ message: 'Password must be string' })
  password: string;

  @IsNotEmpty()
  @IsString({ message: 'Restore code must be string' })
  restoreCode: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'User id must be number' })
  userId: number;
}
