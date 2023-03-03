import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageRepository } from './message.repository';

export const messageTestingModule = Test.createTestingModule({
  imports: [],
  providers: [
    MessageRepository,
    {
      provide: getRepositoryToken(Message),
      useValue: {},
    },
  ],
});
