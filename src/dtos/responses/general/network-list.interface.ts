import { Chain, Gas } from 'src/entities';

export interface NetworkList extends Chain {
  gas?: Gas[];
}
