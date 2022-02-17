import { MODULE_REQUEST } from 'src/module.config';

export const mockCreateRequest: MODULE_REQUEST.CreateMultisigWalletRequest[] = [
  {
    creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8k',
    otherOwnersAddress: ['aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz'],
    threshold: 1,
    internalChainId: 3,
  },
  {
    creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8k',
    otherOwnersAddress: [
      'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
      'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
    ],
    threshold: 1,
    internalChainId: 3,
  },
  {
    creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
    otherOwnersAddress: [],
    threshold: 1,
    internalChainId: 3,
  },
  {
    creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    creatorPubkey: '1',
    otherOwnersAddress: [],
    threshold: 1,
    internalChainId: 3,
  },
];
export const mockSafe: any[] = [
  {
    id: 2,
  },
  {
    id: 3,
    safeAddress: 'aura1hnr59hsqchckgtd49nsejmy5mj400nv6cpmm9v',
    safePubkey:
      '{"type":"tendermint/PubKeyMultisigThreshold","value":{"threshold":"1","pubkeys":[{"type":"tendermint/PubKeySecp256k1","value":"A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk"}]}}',
    threshold: 1,
    status: 'created',
    internalChainId: 3,
  },
];

export const mockSafeOwner: any[] = [
  {
    ownerAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
  },
];

export const mockChain: any[] = [
  {
    rpc: 'http://0.0.0.0:26657',
  },
];
