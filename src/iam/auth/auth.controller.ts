import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup-dto';
import { SigninDto } from './dto/signin-dto';
import { Public } from './decorators/skip-auth.decorator';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { User } from '../../common/models/User';
import { AuthUser } from '../../common/models/AuthUser';
import { TellerDto } from './dto/teller-signup-dto';
import { ActiveUser } from '../decorator/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { Roles } from '../authorization/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { PasswordDto } from './dto/password-dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Roles(Role.Creator)
  @Post('teller-signup')
  tellerSignUp(
    @Body() signupDto: TellerDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.authService.tellerSignUp(signupDto, user);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOkResponse({
    description: 'The user has been successfully signed in.',
    type: AuthUser,
  })
  @Post('signin')
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  // reset password
  @Patch('/reset-password')
  resetPassword(
    @Body() passwordDto: PasswordDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const user_id = user.sub;
    return this.authService.resetPassword(user_id, passwordDto);
  }

  @Public()
  @Post('/forgot-password')
  forgotPassword(@Body() { phone_number }: { phone_number: string }) {
    return this.authService.forgotPassword(phone_number);
  }
}
