export type MockType<T> = {
  [P in keyof T]?: jest.Mock;
};

export const MockFactory = {
  getMock<T>(): MockType<T> {
    const mock: MockType<T> = {};

    Object.getOwnPropertyNames(mock)
      .filter((key: string) => key !== 'constructor')
      .forEach((key: string) => {
        mock[key] = jest.fn();
      });

    return mock;
  },
};
