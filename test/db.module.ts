import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule, ConfigService } from '@nestjs/config';

let mongod: MongoMemoryServer;

export const TestDbModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    return {
      uri: mongoUri,
    };
  },
  inject: [ConfigService],
});

export const closeInMongodConnection = async () => {
  if (mongod) await mongod.stop();
};
