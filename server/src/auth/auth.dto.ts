import {IsNotEmpty, IsString, IsEmail, IsInt} from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString({ message: 'Email must be string' })
  @IsEmail({ message: 'Not a valid email' })
  email: string;

  @IsNotEmpty()
  @IsString({ message: 'Password must be string' })
  password: string;
}

export class RegisterDTO {
  @IsNotEmpty()
  @IsString({ message: 'First name must be string' })
  firstName: string;

  @IsNotEmpty()
  @IsString({ message: 'Last name must be string' })
  lastName: string;

  @IsNotEmpty()
  @IsString({ message: 'Email must be string' })
  @IsEmail({ message: 'Not a valid email' })
  email: string;

  @IsNotEmpty()
  @IsString({ message: 'Password must be string' })
  password: string;

  @IsNotEmpty()
  @IsString({ message: 'Country code must be string' })
  countryCode: string;
}
