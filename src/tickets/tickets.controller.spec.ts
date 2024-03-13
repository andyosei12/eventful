import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

import { Role } from '../users/enums/role.enum';

import { TicketsController } from './tickets.controller';
import { Ticket, TicketSchema } from './schemas/tickets.schema';
import { TicketsService } from './tickets.service';
import { EventsService } from '../events/events.service';
import { Event, EventSchema } from '../events/schemas/event.schema';
import { CreateEventDto } from 'src/events/dto/create-event.dto';
import { Status } from './enums/status.enum';

// import { TestDbModule, closeInMongodConnection } from '../../test/db.module';

jest.setTimeout(100000);
describe('TicketsController', () => {
  let controller: TicketsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let ticketModel: Model<Ticket>;
  let eventModel: Model<Event>;

  //   const EventDto: CreateEventDto = {
  //     title: 'Test Event',
  //     price: 10,
  //     description: 'A test description',
  //     date: new Date(Date.now()),
  //     days_before: 3,
  //     location: 'Accra',
  //     time: '17:00',
  //   };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    ticketModel = mongoConnection.model(Ticket.name, TicketSchema);
    eventModel = mongoConnection.model(Event.name, EventSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        TicketsService,
        { provide: getModelToken(Ticket.name), useValue: ticketModel },
        { provide: getModelToken(Event.name), useValue: eventModel },
      ],
    }).compile();
    controller = app.get<TicketsController>(TicketsController);
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

  const EventDto: CreateEventDto = {
    title: 'Test Event',
    price: 10,
    description: 'A test description',
    date: new Date(Date.now()),
    days_before: 3,
    location: 'Accra',
    time: '17:00',
  };

  it('should create a ticket', async () => {
    const userId = '6009c0eee65f6dce28fb3e50' as unknown as Types.ObjectId;
    const event = await eventModel.create(EventDto);
    const ticket = await controller.create(
      { event_id: event._id.toString(), status: Status.Pending, daysBefore: 3 },
      { sub: userId, email: 'drew@mail.com', role: Role.Regular },
    );
    expect(ticket.qr_code).toBeDefined();
  });
});
