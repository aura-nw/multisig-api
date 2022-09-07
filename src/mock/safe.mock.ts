import { MODULE_REQUEST } from 'src/module.config';

export const mockCreateRequest: MODULE_REQUEST.CreateMultisigWalletRequest[] = [
  {
    // creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    // creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8k',
    otherOwnersAddress: ['aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz'],
    threshold: 1,
    internalChainId: 3,
  },
  {
    // creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    // creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8k',
    otherOwnersAddress: [
      'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
      'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
    ],
    threshold: 1,
    internalChainId: 3,
  },
  {
    // creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    // creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
    otherOwnersAddress: [],
    threshold: 1,
    internalChainId: 3,
  },
  {
    // creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    // creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
    otherOwnersAddress: [],
    threshold: 2,
    internalChainId: 3,
  },
  {
    // creatorAddress: 'aura1kmd8r5pr0phasvm879fcymv35zw6r5jjtsqs26',
    // creatorPubkey: 'AqpOzQNpjQR6lf8kkZpPuqUDO76Lr3K7I2of3jOrxFUL',
    otherOwnersAddress: [],
    threshold: 1,
    internalChainId: 21,
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
    creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    status: 'created',
    internalChainId: 3,
  },
  {
    id: 4,
    safeAddress: null,
    safePubkey: null,
    threshold: 1,
    status: 'pending',
    internalChainId: 3,
    creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    addressHash: 'eIiLk7NmC+CLkq91eQPvGoLDUnPPZK81eRJi3t0dD4s=',
  },
  {
    id: 5,
    safeAddress: null,
    safePubkey: null,
    threshold: 1,
    status: 'pending',
    internalChainId: 3,
    creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    addressHash: 'eIiLk7NmC+CLkq91eQPvGoLDUnPPZK81eRJi3t0dD4s=',
  },
  {
    id: 6,
    safeAddress: null,
    safePubkey: null,
    threshold: 1,
    status: 'pending',
    internalChainId: 3,
    creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    addressHash: 'eIiLk7NmC+CLkq91eQPvGoLDUnPPZK81eRJi3t0dD4s=',
  },
];

export const mockSafeOwner: any[] = [
  {
    ownerAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    ownerPubkey: null,
  },
  {
    ownerAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
    ownerPubkey: null,
  },
  {
    ownerAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    ownerPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
  },
  {
    ownerAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
    ownerPubkey: 'A9+iothzb3kRD9MOzHqaKsM7ooptslYBIXN+Rz4+cg+y',
  },
  {
    ownerAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
    ownerPubkey: null,
  },
  {
    ownerAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
    ownerPubkey: null,
  },
  {
    ownerAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
    ownerPubkey: null,
  },
  {
    ownerAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
    ownerPubkey: null,
  },
  {
    ownerAddress: 'aura1m92zhmujw5ndche9avqt5cj59cfrta96gmqs9a',
    ownerPubkey: null,
  },
];

export const mockChain: any[] = [
  {
    rpc: 'https://localhost:26657',
    prefix: 'aura',
  },
  {
    rpc: 'https://rpc.dev.aura.network',
    prefix: 'aura',
  },
];
