# Testing

[**_Testing helps ensure that releases meet quality and performance goals._**](https://docs.nestjs.com/fundamentals/testing)

## Installation

To get started, first install the required package:

```
npm i --save-dev @nestjs/testing
```

## Unit testing

- Create test file located near the classes it test. Testing files should have a `.spec` suffix. Example:
  ```code
  controllers
  ├── multisig-wallet.controller.spec.ts
  ├── multisig-wallet.controller.ts
  ├── owner.controller.spec.ts
  ├── owner.controller.ts
  ```
- Inside the test file, you first need to create a block that groups together several related tests. For example, when test controller `Owner`:

  ```ts
  describe(OwnerController.name, () => {
   ...
  });
  ```

- Inside the newly created block, define the functions that will be run on different events:

  - `beforeAll`: Runs a function before any of the tests in this file run.
  - `afterAll`: Runs a function after all the tests in this file have completed.
  - `beforeEach`: Runs a function before each of the tests in this file runs.
  - `afterEach`: Runs a function after each one of the tests in this file completes.

  ```ts
  describe(OwnerController.name, () => {
    beforeAll(async () => {
      ...
    }
    beforeEach(() => {
      ...
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    afterAll(async () => {
      ...
    });
  });
  ```

- For NestJS, need to initialize testModule first

  ```ts
  describe(OwnerController.name, () => {
    let testModule: TestingModule;
    let ownerController: OwnerController;

    beforeAll(async () => {
      mockCreateQueryBuilder = jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }));

      testModule = await Test.createTestingModule({
        controllers: [OwnerController],
        providers: [
          MultisigWalletService,
          {
            provide: getRepositoryToken(ENTITIES_CONFIG.CHAIN),
            useValue: {},
          },
          //mock
          {
            provide: getRepositoryToken(ENTITIES_CONFIG.SAFE),
            useValue: {
              createQueryBuilder: mockCreateQueryBuilder,
            },
          },
          {
            provide: getRepositoryToken(ENTITIES_CONFIG.SAFE_OWNER),
            useValue: {},
          },
          //repository
          {
            provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_REPOSITORY,
            useClass: MultisigWalletRepository,
          },
          {
            provide: REPOSITORY_INTERFACE.IMULTISIG_WALLET_OWNER_REPOSITORY,
            useClass: MultisigWalletOwnerRepository,
          },
          {
            provide: REPOSITORY_INTERFACE.IGENERAL_REPOSITORY,
            useClass: GeneralRepository,
          },
          //service
          {
            provide: SERVICE_INTERFACE.IMULTISIG_WALLET_SERVICE,
            useClass: MultisigWalletService,
          },
          {
            provide: SERVICE_INTERFACE.IGENERAL_SERVICE,
            useClass: GeneralService,
          },
        ],
        imports: [SharedModule],
      }).compile();
      ownerController = testModule.get<OwnerController>(OwnerController);
    });
  });
  ```

  - `createTestingModule()`: takes a module metadata object as its argument (the same object you pass to the `@Module()` decorator). Returns a `TestingModule` instance.
  - `compile()` method: bootstraps a module with its dependencies (similar to the way an application is bootstrapped in the conventional `main.ts` file using NestFactory.create()). Returns a module that is ready for testing
  - `jest.fn()`: mock funtion. Example ([jest documentation](https://jestjs.io/docs/mock-functions#mock-return-values)):

    ```ts
    const myMock = jest.fn();
    console.log(myMock());
    // > undefined

    myMock
      .mockReturnValueOnce(10)
      .mockReturnValueOnce('x')
      .mockReturnValue(true);

    console.log(myMock(), myMock(), myMock(), myMock());
    // > 10, 'x', true, true
    ```

  - `getRepositoryToken`: is a helper method that allows you to get the same injection token that `@InjectRepository()` returns. Provide a mock of the Repository methods without the need to actually talk to the database ([stackoverflow](https://stackoverflow.com/a/65570733/8461456))

- Next, we need to create test blocks corresponding to the functions to be tested in the controller. For example:
  ```ts
  describe(MultisigWalletController.name, () => {
    ...
    describe('when create a multisig wallet', () => {
      ...
    });
    describe('when get a multisig wallet', () => {
      ...
    });
    describe('when get balance of multisig wallet', () => {
      ...
    });
    ...
  });
  ```
- Inside a block are possible cases that will happend when calling that method. Example when test method `createMultisigWallet` in `multisig-wallet.controller.ts`:

  ```ts
  async createMultisigWallet(
    @Body() request: MODULE_REQUEST.CreateMultisigWalletRequest,
  ) {
    this.logger.log('========== Create a multisig wallet ==========');
    return await this.multisigWalletService.createMultisigWallet(request);
  }
  ```

  The method `createMultisigWallet` of `multisigWalletService` will be called.

  ```ts
    async createMultisigWallet(
      request: MODULE_REQUEST.CreateMultisigWalletRequest,
    ): Promise<ResponseDto<any>> {
      const res = new ResponseDto();
      try {
        const { creatorAddress, creatorPubkey, threshold, internalChainId } =
          request;
        let { otherOwnersAddress } = request;

        // Check input
        if (otherOwnersAddress.indexOf(creatorAddress) > -1)
          return res.return(ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR);
        if (this.commonUtil.checkIfDuplicateExists(otherOwnersAddress))
          return res.return(ErrorMap.DUPLICATE_SAFE_OWNER);
        const chainInfo = (await this.generalRepo.findOne(
          internalChainId,
        )) as Chain;
        if (!chainInfo) return res.return(ErrorMap.CHAIN_ID_NOT_EXIST);
  ```

  What we need to do is 100% code coverage. For example in the first case, function `createMultisigWallet` will return the error `OTHER_ADDRESS_INCLUDE_CREATOR` if the array `otherOwnersAddress` contains the value of `creatorAddress`. We will write the test as follows:

  ```ts
  describe('when get balance of multisig wallet', () => {
    it(`should return error: ${ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR.Message}`, async () => {
      const result = await safeController.createMultisigWallet({
        creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
        creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8k',
        otherOwnersAddress: ['aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz'],
        threshold: 1,
        internalChainId: 3,
      });
      expect(result.Message).toEqual(
        ErrorMap.OTHER_ADDRESS_INCLUDE_CREATOR.Message,
      );
    });
  });
  ```

- For example when mock repository:

  ```ts
  describe(MultisigWalletController.name, () => {
    let testModule: TestingModule;
    let mockFindOneChain: jest.Mock;
    let mockCreateQueryBuilder: jest.Mock;
    ...

    beforeAll(async () => {
      mockFindOneChain = jest.fn();
      ...
      mockCreateQueryBuilder = jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }));
      ...

      testModule = await Test.createTestingModule({
        controllers: [MultisigWalletController],
        providers: [
          ...
          {
            provide: getRepositoryToken(ENTITIES_CONFIG.CHAIN),
            useValue: {
              findOne: mockFindOneChain,
              find: ...
              save: ...
              ...
              createQueryBuilder: mockCreateQueryBuilder,
            },
          },
          ...
        ]
        ...
      });
    });
    ...
    describe('when create a multisig wallet', () => {
      it(`should return error: ${ErrorMap.CHAIN_ID_NOT_EXIST.Message}`, async () => {
        // find chain by internalChainId
        mockFindOneChain.mockResolvedValue(undefined);
        const result = await safeController.createMultisigWallet(
          {
            creatorAddress: 'aura1wqnn7k8hmyqkyknxx9e46e9fuaxx4zdmfvv8xz',
            creatorPubkey: 'A+WDh8hW9bTjvt5NH5DgQHUGrh+V64yusIP6GmeSv8kk',
            otherOwnersAddress: [],
            threshold: 1,
            internalChainId: 3,
          }
        );
        expect(result.Message).toEqual(ErrorMap.CHAIN_ID_NOT_EXIST.Message);
      });
    });
  });
  ```

**_- Note when mocking `createQueryBuilder`_**: Need to mock all nested methods used inside `createQueryBuilder` ([stackoverflow](https://stackoverflow.com/a/62563713/8461456))

## Run test

```
npm test
```

Run with coverage:

```
npm run test:cov
```

Update badge:

```
curl -Os https://uploader.codecov.io/latest/linux/codecov

chmod +x codecov
./codecov -t ${CODECOV_TOKEN}
```

For [Github Action](https://github.com/marketplace/actions/codecov)
