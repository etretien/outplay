import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString({ message: 'Email must be string' })
  @IsEmail({ message: 'Not a valid email' })
  email: string;

  @IsNotEmpty()
  @IsString({ message: 'Password must be string' })
  password: string;
}
