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
