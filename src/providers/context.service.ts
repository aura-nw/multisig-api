import * as requestContext from 'request-context';

export class ContextService {
  private static readonly nameSpace = 'request';

  static get<T>(key: string): T {
    return requestContext.get(ContextService.getKeyWithNamespace(key));
  }

  static set(key: string, value: any): void {
    requestContext.set(ContextService.getKeyWithNamespace(key), value);
  }

  private static getKeyWithNamespace(key: string): string {
    return `${ContextService.nameSpace}.${key}`;
  }
}
