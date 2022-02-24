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
  NO_SAFES_FOUND: {
    Code: 'E003',
    Message: 'No safes found',
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
    Message: 'This safe was deleted',
  },
  TRANSACTION_NOT_EXIST: {
    Code: 'E010',
    Message: 'This transaction is not exist!',
  },
  TRANSACTION_NOT_VALID: {
    Code: 'E011',
    Message: 'This transaction is not valid!',
  },
  BALANCE_NOT_ENOUGH: {
    Code: 'E012',
    Message: 'Balance not enough!',
  },
  USER_HAS_COMFIRMED: {
    Code: 'E013',
    Message: 'User has confirmed before!',
  },
  OTHER_ADDRESS_INCLUDE_CREATOR: {
    Code: 'E014',
    Message: 'otherOwnersAddress are including creatorAddress',
  },
  DUPLICATE_SAFE_OWNER: {
    Code: 'E015',
    Message: 'Duplicate owners address in otherOwnersAddress',
  },
  CHAIN_ID_NOT_EXIST: {
    Code: 'E016',
    Message: 'This chainId is not exist!',
  },
  DUPLICATE_SAFE_ADDRESS_HASH: {
    Code: 'E017',
    Message: 'Duplicate safe information!',
  },
  PERMISSION_DENIED: {
    Code: 'E018',
    Message: 'Permission denied!'
  },
  INSERT_SAFE_FAILED: {
    Code: 'E019',
    Message: 'Insert safe failed!',
  },
  INSERT_SAFE_OWNER_FAILED: {
    Code: 'E020',
    Message: 'Insert safe owner failed!',
  },
  NO_SAFE_OWNERS_FOUND: {
    Code: 'E021',
    Message: 'No safe owners found',
  },
  SAFE_OWNERS_NOT_INCLUDE_ADDRESS: {
    Code: 'E022',
    Message: 'This address was not found in the safe owners list',
  },
  UPDATE_SAFE_OWNER_FAILED: {
    Code: 'E023',
    Message: 'Update safe owner failed!',
  },
  SAFE_ADDRESS_IS_NULL: {
    Code: 'E024',
    Message: 'SafeAddress is null!',
  },
  GET_BALANCE_FAILED: {
    Code: 'E025',
    Message: 'Get balance failed!',
  },
  CANNOT_CREATE_SAFE_ADDRESS: {
    Code: 'E026',
    Message: 'Cannot create safe addresss!',
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
