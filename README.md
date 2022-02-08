# Multisig-backend
Multisignature backend aims to keep track transactions from frontend to Aura Network.

Transactions can also be sent to the service to allow offchain collecting of signatures or informing the owners about a transaction that is pending to be sent to the blockchain.

When collecting of signatures enough to threshold, transactions able to sent to Aura Network.

## Design architecture
Click [here](docs/README.md) to see the design architecture.

## Getting started
### 1. Clone the repository or click on "Use this template" button.
git clone https://github.com/aura-nw/multisig-api

### 2. Enter your newly-cloned folder.
cd multisig-api

### 3. Create Environment variables file.
cp .env.example .env

### 4. Install dependencies. (Make sure nodejs is installed: https://nodejs.org/en/)
npm i

## Setup for development
Multisignature backend use MySQL and Nodejs. Make sure installed them.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

