import { StargateClient } from '@cosmjs/stargate';
import { CustomError } from '../common/customError';
import { ErrorMap } from '../common/error.map';

export function createSignMessageByData(address: string, data: string) {
  const signDoc = {
    chain_id: '',
    account_number: '0',
    sequence: '0',
    fee: {
      gas: '0',
      amount: [],
    },
    msgs: [
      {
        type: 'sign/MsgSignData',
        value: {
          signer: address,
          data: Buffer.from(data, 'utf8').toString('base64'),
        },
      },
    ],
    memo: '',
  };
  return signDoc;
}

export async function checkAccountBalance(
  client: StargateClient,
  address: string,
  denom: string,
  expectedBalance: number,
): Promise<boolean> {
  const balance = await client.getBalance(address, denom);
  if (Number(balance.amount) < expectedBalance) {
    throw new CustomError(ErrorMap.BALANCE_NOT_ENOUGH);
  }
  return true;
}
