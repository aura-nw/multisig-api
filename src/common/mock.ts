export type MockType<T> = {
  [P in keyof T]?: jest.Mock;
};

export const MockFactory = {
  getMock<T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: new (...args: any[]) => T,
    includes?: string[],
  ): MockType<T> {
    const mock: MockType<T> = {};

    Object.getOwnPropertyNames(type.prototype)
      .filter(
        (key: string) =>
          key !== 'constructor' && (!includes || includes.includes(key)),
      )
      .forEach((key: string) => {
        mock[key] = jest.fn();
      });

    return mock;
  },
};
