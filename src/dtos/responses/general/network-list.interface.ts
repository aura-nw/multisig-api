import { Chain, Gas } from '../../../entities';

export interface NetworkList extends Chain {
  gas?: Gas[];
}
