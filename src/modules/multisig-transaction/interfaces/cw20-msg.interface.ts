interface ICw20Tranfer {
  recipient: string;
  amount: string;
}

export interface ICw20Msg {
  transfer: ICw20Tranfer;
}
