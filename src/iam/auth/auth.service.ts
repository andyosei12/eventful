import { ConflictException, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup-dto';
import { UsersService } from 'src/users/users.service';
import { HashingService } from './hashing/hashing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
  ) {}
  async signup(signupDto: SignupDto) {
    try {
      // get user password and hash it
      const password = signupDto.password;
      const hashedPassword = await this.hashingService.hash(password);

      // update the password with the hashed one
      signupDto.password = hashedPassword;
      const user = await this.usersService.create(signupDto);
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
    }
  }
}
