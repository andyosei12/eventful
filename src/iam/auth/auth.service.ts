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
import { SmsService } from 'src/integrations/sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
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
        throw new ConflictException('Phone number already exists');
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

      const message = `Welcome to Efiada. Your password is ${randomPassword}`;

      await this.smsService.sendSms({
        phoneNumber: user.phone_number,
        sender: 'Efiada',
        body: message,
      });
      // await this.mailService.sendMail({
      //   email: user.email,
      //   body: `<h3>Your password is ${randomPassword}</h3>`,
      //   subject: 'Welcome to Efiada',
      // });
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Phone number already exists');
      }
    }
  }

  async signin(signinDto: SigninDto) {
    // check if user with email exists
    const user = await this.usersService.findOne(signinDto.phone_number);
    if (!user) {
      throw new UnauthorizedException(
        'User does not exist. Check phone number or password',
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
      phone_number: user.phone_number,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      expiresIn: this.jwtConfiguration.accessTokenTtl,
    });

    return {
      accessToken,
      user: {
        phoneNumber: user.phone_number,
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
  async forgotPassword(phoneNumber: string) {
    // find the user
    const user = await this.usersService.findOne(phoneNumber);
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

    const message = `Your new password is ${randomPassword}`;

    await this.smsService.sendSms({
      phoneNumber: user.phone_number,
      sender: 'Efiada',
      body: message,
    });

    // await this.mailService.sendMail({
    //   email: user.email,
    //   body: `<h3>Your password is ${randomPassword}</h3>`,
    //   subject: 'Password Reset',
    // });

    return {
      message: 'Password reset successful',
    };
  }
}
