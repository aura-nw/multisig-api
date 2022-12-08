import { MODULE_REQUEST } from '../module.config';

export const mockCreateTransactionRequest: MODULE_REQUEST.CreateTransactionRequest[] =
  [
    {
      from: 'aura1328x7tacz28w96zl4j50qnfg4gqjdd56wqd3ke',
      to: 'aura136v0nmlv0saryev8wqz89w80edzdu3quzm0ve9',
      internalChainId: 4,
      bodyBytes:
        'CogBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmgKK2F1cmExMzJha3g5OTg5Y2FueHV6a2ZqbnJneHd5Y2NmY210ZnpobWZscW0SK2F1cmExdHVlaDRodnJmbmZ3c3VobDMyd21sbWV2NjU2bmhxc2t2cTd0N3QaDAoFdWF1cmESAzIwMBIA',
      signature:
        'Dj8pEXMADBGCjaRSAQwT1/7s+6fRrf985UZL2ujo0YMe+M2VEqYLERkc5tsrg8HAWuqzKVq5CV6a7KcOSgjNtw==',
      authInfoBytes: '',
      accountNumber: 3,
      sequence: 3,
    },
  ];

export const mockChain: any[] = [
  {
    rpc: 'https://localhost:26657',
    prefix: 'aura',
    denom: 'uaura',
  },
  {
    rpc: 'https://tendermint-testnet.aura.network',
    prefix: 'aura',
    denom: 'uaura',
  },
  {
    rpc: 'http://localhost:1111',
    prefix: 'aura',
    denom: 'uaura',
  },
];

export const mockTransaction: any[] = [
  {
    Id: 42,
    CreatedAt: '2022-02-24T09:26:20.921Z',
    UpdatedAt: '2022-03-01T02:25:56.474Z',
    FromAddress: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
    ToAddress: 'aura1l5k37zpxp3ukty282kn6r7kf8rqh7cve0ggq2w',
    TxHash: '40853001059496DD99B21C2274901967ACB6C09FCF10D6DF2DD9548330C9A68F',
    Amount: 100000,
    Denom: 'uaura',
    Status: 'SUCCESS',
    Direction: 'OUTGOING',
    Confirmations: 1,
    ConfirmationsRequired: 1,
  },
  {
    Id: 43,
    CreatedAt: '2022-02-24T09:27:00.010Z',
    UpdatedAt: '2022-03-01T02:25:56.474Z',
    FromAddress: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
    ToAddress: 'aura1l5k37zpxp3ukty282kn6r7kf8rqh7cve0ggq2w',
    TxHash: 'A30637A0F38FF17B0E77F729453054CAD58488A73A5EADC2D461E560D87D85DC',
    Amount: 100000,
    Denom: 'uaura',
    Status: 'SUCCESS',
    Direction: 'OUTGOING',
    Confirmations: 1,
    ConfirmationsRequired: 1,
  },
];
