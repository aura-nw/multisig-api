[![codecov](https://codecov.io/gh/aura-nw/multisig-api/branch/dev/graph/badge.svg?token=FNWOTPBIRX)](https://codecov.io/gh/aura-nw/multisig-api)

# Multisig overview

Currently, our whole infrasture is constituted by mainly 1 frontend service, 2 backend service.

![image](docs/pics/multisig_architecture.png)

The core backend service received data from frontend(mobile app and web app) via API then saved in MySQL transaction information and sent transaction to Aura Network.

The sync service keep track all transaction has broadcasted by Aura Network. If this app is crashed and restarted, program would get current latest block synced in database for each address and latest block in Aura network, then use REST API (Cosmjs) to get all transaction which not synced yet.

# Multisig-backend

Multisignature backend aims to keep track transactions from frontend to Aura Network.

Transactions can also be sent to the service to allow offchain collecting of signatures or informing the owners about a transaction that is pending to be sent to the blockchain.

When collecting of signatures enough to threshold, transactions able to sent to Aura Network.

## Design architecture

Click [here](docs/README.md) to see the design architecture.

## Getting started

### 1. Clone the repository.

```bash
git clone https://github.com/aura-nw/multisig-api
```

### 2. Enter your newly-cloned folder.

```bash
cd multisig-api
```

### 3. Create Environment variables file.

```bash
cp .env.example .env
```

### 4. Install dependencies. (Make sure nodejs is installed: https://nodejs.org/en/)

```bash
npm i
```

## Setup for development

Multisignature backend use MySQL and Nodejs. Make sure installed them.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```
