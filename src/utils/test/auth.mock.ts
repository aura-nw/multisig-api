export class MockJwtStrategy {
  validate(payload) {
    return payload;
  }
}
