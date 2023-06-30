export const ErrorMap = {
  SUCCESSFUL: {
    Code: 'SUCCESSFUL',
    Message: 'Successfully!',
  },
  UNAUTHRORIZED: {
    Code: 'E401',
    Message: 'Unauthorized',
  },
  E001: {
    Code: 'E001',
    Message: 'Invalid address',
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
  USER_HAS_CONFIRMED: {
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
    Message: 'Permission denied!',
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
  USER_HAS_REJECTED: {
    Code: 'E027',
    Message: 'User has rejected before!',
  },
  SAFE_ADRESS_NOT_VALID: {
    Code: 'E028',
    Message: 'Safe address not valid!',
  },
  SAFE_HAS_PENDING_TX: {
    Code: 'E029',
    Message: 'Safe has pending tx!',
  },
  BROADCAST_TX_FAILED: {
    Code: 'E030',
    Message: 'Broadcast transaction failed!',
  },
  ADDRESS_PUBKEY_MISMATCH: {
    Code: 'E031',
    Message: 'The provided public key does not match the address',
  },
  PUBKEY_NOT_BASE64: {
    Code: 'E032',
    Message: 'Pubkey must be Base64 type!',
  },
  SIGNATURE_NOT_BASE64: {
    Code: 'E033',
    Message: 'Signature must be Base64 type!',
  },
  INVALID_TIMESTAMP: {
    Code: 'E034',
    Message: 'Invalid Timestamp!',
  },
  CHAIN_NOT_FOUND: {
    Code: 'E035',
    Message: 'Chain not found!',
  },
  VERIFY_SIGNATURE_FAIL: {
    Code: 'E036',
    Message: 'Verify signature fail!',
  },
  SIGNATURE_VERIFICATION_FAILED: {
    Code: 'E037',
    Message:
      'Signature verification failed! Please reconnect your wallet and try again.',
  },
  USER_NOT_FOUND: {
    Code: 'E038',
    Message: 'User not found',
  },
  REQUEST_ERROR: {
    Code: 'E039',
    Message: 'Request to server error',
  },
  MESSAGE_NOT_EXIST: {
    Code: 'E040',
    Message: 'These message(s) is not exist!',
  },
  INVALID_REQUEST: {
    Code: 'E041',
    Message: 'Invalid request!',
  },
  MISSING_ACCOUNT_AUTH: {
    Code: 'E042',
    Message: 'Missing account_auth when call indexer account info!',
  },
  CANNOT_GET_ACCOUNT_NUMBER_OR_SEQUENCE: {
    Code: 'E043',
    Message: 'Can not get account number or sequence from indexer!',
  },
  CANNOT_CONNECT_TO_CHAIN: {
    Code: 'E044',
    Message: 'Can not connect to chain!',
  },
  TX_SIMULATION_FAILED: {
    Code: 'E045',
    Message: 'Tx simulation failed!',
  },
  INVALID_SAFE: {
    Code: 'E046',
    Message: 'Invalid safe!',
  },
  CANNOT_DELETE_TX: {
    Code: 'E047',
    Message:
      'Can not delete because the status of this transaction is invalid!',
  },
  INVALID_CONTRACT_ADDRESS: {
    Code: 'E048',
    Message: 'Invalid contract address!',
  },
  TRANSACTION_IS_EXECUTING: {
    Code: 'E049',
    Message: 'Transaction is executing!',
  },
  INSERT_TRANSACTION_FAILED: {
    Code: 'E050',
    Message: 'Insert transaction failed!',
  },
  SEND_TRANSACTION_FAILED: {
    Code: 'E051',
    Message: 'Send transaction failed!',
  },
  C001: {
    Code: 'C001',
    Message: 'Missing result from Chaincode',
  },
  E400: {
    Code: 'E400',
    Message: 'Bad request',
  },
  E403: {
    Code: 'E401',
    Message: 'Unauthorized',
  },
  E500: {
    Code: 'E500',
    Message: 'Server error',
  },
};
