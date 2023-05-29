export const getMultisigDetailResponseMock = {
  AuraTxId: 1,
  MultisigTxId: 1,
  TxHash: '4927D86CCFFEFDCBF16BA27CE5C3BD8BA5DE413577055B62065484B83528F1DB',
  Fee: '100',
  Gas: '100000',
  Status: 'SUCCESS',
  ConfirmationsRequired: '1',
  Confirmations: [
    {
      id: 1843,
      createdAt: '2022-08-09T03:48:20.515Z',
      updatedAt: '2022-08-09T03:48:20.515Z',
      ownerAddress: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8',
      signature:
        'WQ1ox9UhZQdcEbSXCaRYM99XcxItsl8rHCVvUW/E7oQGaiN1MH6OluoWQLYGmNIjrhyVkQRY/Qf7a0N/Q9bR2w==',
      status: 'CONFIRM',
    },
  ],
  Rejectors: [
    {
      id: 1846,
      createdAt: '2022-08-09T03:56:05.398Z',
      updatedAt: '2022-08-09T03:56:05.398Z',
      ownerAddress: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8',
      signature: '',
      status: 'SEND',
    },
  ],
  Messages: [
    {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      delegatorAddress: 'aura1nqw4cla0k49yfzpa6afl32hracut6tvwldmuuk',
      validatorAddress: 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx',
    },
  ],
  AutoClaimAmount: 123,
  CreatedAt: new Date(),
  UpdatedAt: new Date(),
  Timestamp: new Date(),
};
