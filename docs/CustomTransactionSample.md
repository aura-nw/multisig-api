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
