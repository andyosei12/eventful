import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup-dto';
import { SigninDto } from './dto/signin-dto';
import { Public } from './decorators/skip-auth.decorator';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { User } from '../../common/models/User';
import { AuthUser } from '../../common/models/AuthUser';

@Controller('auth')
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
}
