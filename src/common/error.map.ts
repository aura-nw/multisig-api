export const ErrorMap = {
  SUCCESSFUL: {
    Code: 'SUCCESSFUL',
    Message: 'Successfully!',
  },
  E001: {
    Code: 'E001',
    Message: `Invalid address`,
  },
  EXISTS: {
    Code: 'E002',
    Message: 'Safe already exists',
  },
  NOTFOUND: {
    Code: 'E003',
    Message: 'Not found',
  },
  SOMETHING_WENT_WRONG: {
    Code: 'E004',
    Message: 'Something went wrong',
  },
  SAFE_WAS_CREATED: {
    Code: 'E005',
    Message: 'This safe was created',
  },
  SAFE_OWNER_PUBKEY_NOT_EMPTY: {
    Code: 'E006',
    Message: 'The pubkey of this safe owner is not empty',
  },
  SAFE_NOT_PENDING: {
    Code: 'E007',
    Message: 'The status of this safe is not pending',
  },
  ADDRESS_NOT_CREATOR: {
    Code: 'E008',
    Message: 'You do not have permission. Require creator!',
  },
  SAFE_WAS_DELETED: {
    Code: 'E009',
    Message: 'This safe was created',
  },
  TRANSACTION_NOT_EXIST: {
    Code: 'E010',
    Message: 'This transaction is not exist!',
  },
  TRANSACTION_NOT_VALID: {
    Code: 'E011',
    Message: 'This transaction is not valid!',
  },
  C001: {
    Code: 'C001',
    Message: `Missing result from Chaincode`,
  },
  E400: {
    Code: 'E400',
    Message: `Bad request`,
  },
  E403: {
    Code: 'E401',
    Message: `Unauthorized`,
  },
  E500: {
    Code: 'E500',
    Message: `Server error`,
  },
};
