export class SimulateResponse {
  gasUsed: number;
}

export class OwnerSimulateSignResponse {
  address: string;

  signature: Uint8Array;

  bodyBytes: Uint8Array;
}
