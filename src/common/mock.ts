import { Repository } from 'typeorm';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

export class MockFactory {
  static getMock<T>(
    type: new (...args: any[]) => T,
    includes?: string[],
  ): MockType<T> {
    const mock: MockType<T> = {};

    Object.getOwnPropertyNames(type.prototype)
      .filter(
        (key: string) =>
          key !== 'constructor' && (!includes || includes.includes(key)),
      )
      .map((key: string) => {
        mock[key] = jest.fn();
      });

    return mock;
  }
}
