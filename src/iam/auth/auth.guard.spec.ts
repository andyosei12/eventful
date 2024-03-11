import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
describe('AuthGuard', () => {
  const reflector = new Reflector();
  let service: JwtService;
  it('should be defined', () => {
    expect(
      new AuthGuard(
        service,
        { secret: 'jwtService', accessTokenTtl: 3600 },
        reflector,
      ),
    ).toBeDefined();
  });
});
