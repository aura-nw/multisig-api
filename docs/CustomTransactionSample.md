# Custom Transaction

This document contains the raw message samples for different transaction types.

## Send

## Delegate

## Set Withdraw Reward Address

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
