import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
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
import { Types } from 'mongoose';
import { PasswordDto } from './dto/password-dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

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
    try {
      // generate a random password
      const randomPassword = Math.random().toString(36).slice(-8);
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

  // reset user password
  async resetPassword(user_id: Types.ObjectId, passwordDto: PasswordDto) {
    // find the user
    const user = await this.usersService.findOneById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // compare if current passwords match
    const isPasswordMatch = await this.hashingService.compare(
      passwordDto.currentPassword,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new ConflictException('Passwords do not match');
    }

    // hash new password
    const password = await this.hashingService.hash(passwordDto.newPassword);

    const updateObj: UpdateUserDto = {
      password,
    };

    return await this.usersService.findOneAndUpdate(user_id, updateObj);
  }

  // forgot password
  async forgotPassword(email: string) {
    // find the user
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // generate a random password
    const randomPassword = Math.random().toString(36).slice(-8);
    // hash generated password
    const hashedPassword = await this.hashingService.hash(randomPassword);

    const updateObj: UpdateUserDto = {
      password: hashedPassword,
    };

    await this.usersService.findOneAndUpdate(user._id, updateObj);

    await this.mailService.sendMail({
      email: user.email,
      body: `<h3>Your password is ${randomPassword}</h3>`,
      subject: 'Password Reset',
    });

    return {
      message: 'Password reset successful',
    };
  }
}
