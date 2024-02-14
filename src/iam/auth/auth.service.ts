import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup-dto';
import { UsersService } from 'src/users/users.service';
import { HashingService } from './hashing/hashing.service';
import { SigninDto } from './dto/signin-dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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

  async signin(signinDto: SigninDto) {
    // check if user with email exists
    const user = await this.usersService.findOne(signinDto.email);
    if (!user) {
      throw new UnauthorizedException(
        'User does not exist. Check email or password',
      );
    }

    // compare the password
    const isPasswordMatch = await this.hashingService.compare(
      signinDto.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException(
        'User does not exist. Check email or password',
      );
    }

    // send a jwt token
    const payload: ActiveUserData = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      expiresIn: this.jwtConfiguration.accessTokenTtl,
    });

    return {
      accessToken,
      user: {
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        id: user._id,
      },
    };
  }
}
