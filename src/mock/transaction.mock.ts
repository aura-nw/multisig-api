import { MODULE_REQUEST } from 'src/module.config';

export const mockCreateTransactionRequest: MODULE_REQUEST.CreateTransactionRequest[] =
  [
    {
      from: 'aura1328x7tacz28w96zl4j50qnfg4gqjdd56wqd3ke',
      to: 'aura136v0nmlv0saryev8wqz89w80edzdu3quzm0ve9',
      amount: 3000000,
      fee: 0.01,
      gasLimit: 100000,
      internalChainId: 4,
      bodyBytes:
        'CogBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmgKK2F1cmExMzJha3g5OTg5Y2FueHV6a2ZqbnJneHd5Y2NmY210ZnpobWZscW0SK2F1cmExdHVlaDRodnJmbmZ3c3VobDMyd21sbWV2NjU2bmhxc2t2cTd0N3QaDAoFdWF1cmESAzIwMBIA',
      signature:
        'Dj8pEXMADBGCjaRSAQwT1/7s+6fRrf985UZL2ujo0YMe+M2VEqYLERkc5tsrg8HAWuqzKVq5CV6a7KcOSgjNtw==',
      creatorAddress: 'aura13t8ej6yvje8n9zl7hcvj8ks24tp5qvdsgfhnjx',
    },
  ];

  export const mockChain: any[] = [
    {
      rpc: 'http://0.0.0.0:26657',
      prefix: 'aura',
      denom: 'uaura'
    },
    {
      rpc: 'https://tendermint-testnet.aura.network',
      prefix: 'aura',
      denom: 'uaura'
    },
    {
      rpc: 'http://0.0.0.0:1111',
      prefix: 'aura',
      denom: 'uaura'
    },
  ];