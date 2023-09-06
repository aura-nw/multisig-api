# Custom Transaction

This document contains the raw message samples for different transaction types.

## Send

```json
[
    {
        "typeUrl": "/cosmos.bank.v1beta1.MsgSend",
        "value": {
            "fromAddress": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
            "toAddress": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8",
            "amount": [{
                "denom": "uaura",
                "amount": "345000"
            }]
        }
    }
]
```

## MultiSend

```json
[
  {
    "typeUrl": "/cosmos.bank.v1beta1.MsgMultiSend",
    "value": {
      "inputs": [
        {
          "address": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8",
          "coins": [
            {
              "denom": "uaura",
              "amount": "200000"
            }
          ]
        }
      ],
      "outputs": [
        {
          "address": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
          "coins": [
            {
              "denom": "uaura",
              "amount": "100000"
            }
          ]
        },
        {
          "address": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
          "coins": [
            {
              "denom": "uaura",
              "amount": "100000"
            }
          ]
        }
      ]
    }
  }
]

```

## Delegate

```json
[
    {
        "typeUrl": "/cosmos.staking.v1beta1.MsgDelegate",
        "value": {
            "delegatorAddress": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
            "validatorAddress": "auravaloper199zph4r44yvn8veraukw2c508z4pqrqxsrxv7t",
            "amount": {
                "denom": "uaura",
                "amount": "345000"
            }
        }
    }
]
```

## Begin Redelegate

```json
[
  {
    "typeUrl": "/cosmos.staking.v1beta1.MsgBeginRedelegate",
    "value":  {
      "delegatorAddress": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
      "validatorSrcAddress": "auravaloper199zph4r44yvn8veraukw2c508z4pqrqxsrxv7t",
      "validatorDstAddress": "auravaloper1p46fqn68az9lcwvfh0as5n04ua8t7mh4rc3em6",
      "amount": {
        "denom": "uaura",
        "amount": "345000"
    }
    }
  }
]
```

## Create Validator

```json
[
  {
    "typeUrl": "/cosmos.staking.v1beta1.MsgCreateValidator",
    "value": {
      "description": {
        "moniker": "validator",
        "identity": "me",
        "website": "valid.com",
        "securityContact": "Hamburglar",
        "details": "..."
      },
      "commission": {
        "rate": "200000000000000000",
        "maxRate": "300000000000000000",
        "maxChangeRate": "100000000000000000"
      },
      "minSelfDelegation": "123",
      "delegatorAddress": "aura1casvkkuhpzv9gz72t6tthyeuvkw9qgcek9y32x",
      "validatorAddress": "aura1p46fqn68az9lcwvfh0as5n04ua8t7mh4c2q3ry",
      "pubkey": {
        "typeUrl": "/cosmos.crypto.secp256k1.PubKey",
        "value": "Pubkey in Base64 format"
      },
      "value": {
        "denom": "uaura",
        "amount": "345000"
      }
    }
  }
]
```

## Edit Validator

```json
[
  {
    "typeUrl": "/cosmos.staking.v1beta1.MsgEditValidator",
    "value": {
      "description": {
        "moniker": "validator",
        "identity": "me",
        "website": "valid.com",
        "securityContact": "Hamburglar",
        "details": "..."
      },
      "commissionRate": "21000000000000000",
      "minSelfDelegation": "123",
      "validatorAddress": "aura1p46fqn68az9lcwvfh0as5n04ua8t7mh4c2q3ry"
    }
  }
]
```

## Undelegate

```json
[
    {
        "typeUrl": "/cosmos.staking.v1beta1.MsgUndelegate",
        "value": {
            "delegatorAddress": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
            "validatorAddress": "auravaloper1mvm4f62j96dw79gvc3zhyuef7wh453ca8rltx5",
            "amount": {
                "denom": "uaura",
                "amount": "345000"
            }
        }
    }
]
```

## Set Withdraw Reward Address

```json
[
  {
    "typeUrl": "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress",
    "value": {
      "delegatorAddress": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
      "withdrawAddress": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
    }
  }
]
```

## Fund Community Pool

```json
[
  {
    "typeUrl": "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress",
    "value": {
      "amount": [
        {
          "denom": "uaura",
          "amount": "100000"
        }
      ],
      "depositor": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
    }
  }
]
```

## Withdraw Delegator Reward

```json
[
  {
    "typeUrl": "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
    "value": {
      "delegatorAddress": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
      "validatorAddress": "auravaloper1mvm4f62j96dw79gvc3zhyuef7wh453ca8rltx5"
    }
  }
]
```

## Withdraw Validator Commission

```json
[
  {
    "typeUrl": "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission",
    "value": {
      "validatorAddress": "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5"
    }
  }
]
```

## Deposit

```json
[
  {
    "typeUrl": "/cosmos.gov.v1beta1.MsgDeposit",
    "value": {
      "amount": [{ "amount": "12300000", "denom": "uaura" }],
      "depositor": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
      "proposalId": "5"
    }
  }
]
```

## Submit Proposal

```json
[
  {
    "typeUrl": "/cosmos.gov.v1beta1.MsgSubmitProposal",
    "value": {
      "initialDeposit": [{ "amount": "12300000", "denom": "uaura" }],
      "proposer": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
      "content": {
        "typeUrl": "/cosmos.gov.v1beta1.TextProposal",
        "value": "Uint8Array TextProposal"
      }
    }
  }
]
```

## Vote

```json
[
  {
    "typeUrl": "/cosmos.gov.v1beta1.MsgVote",
    "value": {
      "option": "VOTE_OPTION_YES",
      "proposalId": "5",
      "voter": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
    }
  }
]
```

## Vote Weighted

```json
[
  {
    "typeUrl": "/cosmos.gov.v1beta1.MsgVoteWeighted",
    "value": {
        "proposalId": "5",
        "voter": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
        "options": [
          { "option": "VOTE_OPTION_NO_WITH_VETO", "weight": "700000000000000000" },
          { "option": "VOTE_OPTION_NO", "weight": "300000000000000000" }
        ],
      }
  }
]
```

## Wasm - Clear Admin

```json
[
  {
    "typeUrl": "/cosmwasm.wasm.v1.MsgClearAdmin",
    "value": {
      "sender": "aura1casvkkuhpzv9gz72t6tthyeuvkw9qgcek9y32x",
      "contract": "aura1enk26v05pyhkmg2tjrmmk7ecf6hv0nk8n3ngd608gq9cqcc3p5zs4efpx6"
    }
  }
]
```

## Wasm - Store Code

```json
[
  {
    "typeUrl": "/cosmwasm.wasm.v1.MsgStoreCode",
    "value": {
      "sender": "aura1casvkkuhpzv9gz72t6tthyeuvkw9qgcek9y32x",
      "wasmByteCode": "ByteCode Base64 format"
    }
  }
]
```

## Migrate Contract

```json
[
  {
    "typeUrl": "/cosmwasm.wasm.v1.MsgMigrateContract",
    "value": {
      "sender": "aura1casvkkuhpzv9gz72t6tthyeuvkw9qgcek9y32x",
      "contract": "aura1enk26v05pyhkmg2tjrmmk7ecf6hv0nk8n3ngd608gq9cqcc3p5zs4efpx6",
      "codeId": "98765",
      "msg": { "foo": "bar" }
    }
  }
]
```

## Instantiate contract

CW20:

```json
[
  {
    "typeUrl": "/cosmwasm.wasm.v1.MsgInstantiateContract",
    "value": {
      "sender": "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x",
      "codeId": "582",
      "label": "cw20 contract",
      "admin": "",
      "msg": {
        "name": "EZPZ",
        "symbol": "EZPZ",
        "decimals": 18,
        "minter": "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x",
        "mint": {
          "minter": "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x",
          "cap": "1000000000000000000000000000"
        },
        "initial_balances": [
          {
            "address": "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x",
            "amount": "1000000000000000000000000000"
          }
        ]
      },
      "funds": []
    }
  }
]
```

CW721:

```json
[
  {
    "typeUrl": "/cosmwasm.wasm.v1.MsgInstantiateContract",
    "value": {
      "sender": "aura1agsqhsrnpgcf5wht50qe5zgt4rzkg4uml8urvh",
      "codeId": "584",
      "label": "CW721 contract",
      "msg": {
        "name": "CW721 Token",
        "symbol": "CW721",
        "minter": "aura1agsqhsrnpgcf5wht50qe5zgt4rzkg4uml8urvh"
      },
      "funds": []
    }
  }
]
```

## Execute contract

```json
[
  {
    "typeUrl": "/cosmwasm.wasm.v1.MsgExecuteContract",
    "value": {
      "sender": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
      "contract": "aura1vgj4ngh5jyy7xdzskxxsfpzw5mqkp9mjzv9avas42ndkmfzwh94sjnmdtx",
      "msg": {
        "mint": {
          "phase_id": 4,
          "amount": 1
        }
      },
      "funds": [
        {
          "denom": "uaura",
          "amount": "2000000"
        }
      ]
    }
  }
]
```

## Wasm - UpdateAdmin

```json
[
  {
    "typeUrl": "/cosmwasm.wasm.v1.MsgUpdateAdmin",
    "value": {
      "sender": "aura1yukgemvxtr8fv6899ntd65qfyhwgx25d2nhvj6",
      "newAdmin": "aura1agsqhsrnpgcf5wht50qe5zgt4rzkg4uml8urvh",
      "contract": "aura1enk26v05pyhkmg2tjrmmk7ecf6hv0nk8n3ngd608gq9cqcc3p5zs4efpx6",
    }
  }
]
```

## IBC Transfer

```json
[
  {
    "typeUrl": "/ibc.applications.transfer.v1.MsgTransfer",
    "value": {
      "sourcePort": "testport",
      "sourceChannel": "testchannel",
      "token": {
        "denom": "uaura",
        "amount": "100000"
      },
      "sender": "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
      "receiver": "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
      "timeoutHeight": {
        "revisionHeight": "123",
        "revisionNumber": "456"
      },
      "timeoutTimestamp": "789",
      "memo": ""
    }
  }
]
```
