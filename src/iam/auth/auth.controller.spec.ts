import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { SignupDto } from './dto/signup-dto';
import { User, UserSchema } from '../../users/schemas/users.schema';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
// import { TestDbModule, closeInMongodConnection } from '../../test/db.module';

jest.setTimeout(100000);
describe('AuthController', () => {
  let controller: AuthController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;

  const UserDto: SignupDto = {
    email: 'drew@mail.com',
    first_name: 'Drew',
    last_name: 'Osei',
    password: 'willkommen',
    role: 'regular',
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: HashingService, useClass: BcryptService },
        JwtService,
        {
          provide: 'CONFIGURATION(jwt)',
          useValue: { secret: 'testEnvJwt', accessTokenTtl: 3600 },
        },
      ],
    }).compile();
    controller = app.get<AuthController>(AuthController);
  });

  beforeEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  // afterEach(async () => {

  // });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('should register a new user', async () => {
    const createdUser = await controller.signup(UserDto);

    expect(createdUser.email).toBe(UserDto.email);
  });

  it('should login a user', async () => {
    const createdUser = await userModel.create(UserDto);
    const user = await controller.signin({
      email: createdUser.email,
      password: 'willkommen',
    });
    expect(user.accessToken).toBeDefined();
    expect(user.user.email).toBe(createdUser.email);
  });

  it('should not successfully log in user if email does not exist', async () => {
    await userModel.create(UserDto);
    expect(
      async () =>
        await controller.signin({
          email: 'nana@mail.com',
          password: 'hellopassword',
        }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
