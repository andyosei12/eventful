import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup-dto';
import { TellerDto } from './dto/teller-signup-dto';
import { UsersService } from '../../users/users.service';
import { HashingService } from './hashing/hashing.service';
import { SigninDto } from './dto/signin-dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { Role } from 'src/users/enums/role.enum';
import { MailService } from 'src/integrations/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

  async tellerSignUp(signupDto: TellerDto, activeUser: ActiveUserData) {
    if (activeUser.role !== Role.Creator) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    try {
      // generate a random password
      const randomPassword = Math.random().toString(36).slice(-8);
      console.log(randomPassword);
      // hash generated password
      const hashedPassword = await this.hashingService.hash(randomPassword);

      // update the password with the hashed one
      signupDto.password = hashedPassword;
      signupDto.role = Role.Teller;
      const user = await this.usersService.create(signupDto);
      await this.usersService.createTeller({
        user_id: user._id,
        creator_id: activeUser.sub,
      });
      await this.mailService.sendMail({
        email: user.email,
        body: `<h3>Your password is ${randomPassword}</h3>`,
        subject: 'Welcome to Efiada',
      });
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
