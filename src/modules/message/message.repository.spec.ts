import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { TxTypeUrl } from '../../common/constants/app.constant';
import { MockFactory } from '../../common/mock';
import { IMessageUnknown } from '../../interfaces';
import { Message } from './entities/message.entity';
import { messageTestingModule } from './message-testing.module';
import { MessageRepository } from './message.repository';
import { messageMock } from '../../mock';
import { TxMessageResponseDto } from './dto';

describe('MessageRepository', () => {
  let messageRepository: MessageRepository;
  let mockRepo = MockFactory.getMock(Repository<Message>);

  beforeEach(async () => {
    const module: TestingModule = await messageTestingModule
      .overrideProvider(getRepositoryToken(Message))
      .useValue(mockRepo)
      .compile();

    messageRepository = module.get<MessageRepository>(MessageRepository);
  });

  it('should be defined', () => {
    expect(messageRepository).toBeDefined();
  });

  describe('saveMsgs', () => {
    it('should return array of saved msgs', async () => {
      const txIdMock = 1;
      const msgsMock: IMessageUnknown[] = [
        {
          typeUrl: TxTypeUrl.SEND,
          value: {
            amount: [
              {
                amount: '1000000',
                denom: 'utaura',
              },
            ],
          },
        },
      ];

      const expected = plainToInstance(Message, [
        {
          txId: txIdMock,
          amount: '1000000',
          typeUrl: TxTypeUrl.SEND,
        },
      ]);
      mockRepo.save = jest.fn(async (msgs: Message) => msgs);

      expect(
        await messageRepository.saveMsgs(txIdMock, msgsMock),
      ).toStrictEqual(expected);
    });
  });

  describe('getMsgsByTxId', () => {
    it('should return array of messages', async () => {
      const txIdMock = 1;

      mockRepo.find = jest.fn(async ({ where: { txId } }) =>
        messageMock.find((msg) => msg.txId === txId),
      );

      const expected = plainToInstance(
        TxMessageResponseDto,
        messageMock.find((msg) => msg.txId === txIdMock),
        {
          excludeExtraneousValues: true,
        },
      );

      expect(await messageRepository.getMsgsByTxId(txIdMock)).toStrictEqual(
        expected,
      );
    });
  });

  describe('getMsgsByAuraTxId', () => {
    it('should return array of messages', async () => {
      const auraTxId = 1;

      mockRepo.find = jest.fn(async ({ where: { auraTxId } }) =>
        messageMock.find((msg) => msg.auraTxId === auraTxId),
      );

      const expected = plainToInstance(
        TxMessageResponseDto,
        messageMock.find((msg) => msg.auraTxId === auraTxId),
        {
          excludeExtraneousValues: true,
        },
      );

      expect(await messageRepository.getMsgsByAuraTxId(auraTxId)).toStrictEqual(
        expected,
      );
    });
  });
});
