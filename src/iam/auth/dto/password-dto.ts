import { IsString, MinLength } from 'class-validator';

export class PasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
