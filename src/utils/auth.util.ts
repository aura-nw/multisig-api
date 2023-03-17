export class AuthUtil {
  /**
   * createSignMessageByData
   * @param address
   * @param data
   * @returns
   */
  public static createSignMessageByData(address: string, data: string) {
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
}
