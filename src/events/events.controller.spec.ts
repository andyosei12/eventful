import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Role } from '../users/enums/role.enum';
import {
  CACHE_MANAGER,
  Cache,
  CacheInterceptor,
  CacheModule,
} from '@nestjs/cache-manager';

// import { TestDbModule, closeInMongodConnection } from '../../test/db.module';

jest.setTimeout(100000);
describe('EventsController', () => {
  let controller: EventsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let eventModel: Model<Event>;

  const EventDto: CreateEventDto = {
    title: 'Test Event',
    price: 10,
    description: 'A test description',
    date: new Date(Date.now()),
    days_before: 3,
    location: 'Accra',
    time: '17:00',
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    eventModel = mongoConnection.model(Event.name, EventSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        EventsService,
        { provide: getModelToken(Event.name), useValue: eventModel },
        { provide: CACHE_MANAGER, useValue: new Map() },
      ],
    }).compile();
    controller = app.get<EventsController>(EventsController);
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

  it('should create a new event', async () => {
    const creatorId = '6009c0eee65f6dce28fb3e50' as unknown as Types.ObjectId;
    const event = await controller.create(EventDto, {
      sub: creatorId,
      email: 'drew@mail.com',
      role: Role.Creator,
    });

    expect(event.title).toBe(EventDto.title);
  });

  it('should get all events', async () => {
    const creatorId = '6009c0eee65f6dce28fb3e50' as unknown as Types.ObjectId;
    await controller.create(EventDto, {
      sub: creatorId,
      email: 'drew@mail.com',
      role: Role.Creator,
    });
    const events = await controller.findAll();
    expect(events).toHaveLength(1);
  });

  it('should get an event', async () => {
    const creatorId = '6009c0eee65f6dce28fb3e50' as unknown as Types.ObjectId;
    const event = await controller.create(EventDto, {
      sub: creatorId,
      email: 'drew@mail.com',
      role: Role.Creator,
    });

    const existingEvent = await controller.findOne(event._id.toString());
    expect(existingEvent.title).toBe(EventDto.title);
  });

  it('should remove an event', async () => {
    const creatorId = '6009c0eee65f6dce28fb3e50' as unknown as Types.ObjectId;
    const createdEvent = await controller.create(EventDto, {
      sub: creatorId,
      email: 'drew@mail.com',
      role: Role.Creator,
    });
    const event = await controller.remove(createdEvent._id.toString());
    expect(event.acknowledged).toBeDefined();
  });
});
