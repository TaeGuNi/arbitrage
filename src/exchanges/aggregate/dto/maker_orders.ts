import MakerOrder, { default_maker_order } from "./maker_order";

export default interface MakerOrders {
  ada: MakerOrder;
  algo: MakerOrder;
  atom: MakerOrder;
  btc: MakerOrder;
  doge: MakerOrder;
  eth: MakerOrder;
  matic: MakerOrder;
  sol: MakerOrder;
}

export const default_maker_orders: MakerOrders = {
  ada: structuredClone(default_maker_order),
  algo: structuredClone(default_maker_order),
  atom: structuredClone(default_maker_order),
  btc: structuredClone(default_maker_order),
  doge: structuredClone(default_maker_order),
  eth: structuredClone(default_maker_order),
  matic: structuredClone(default_maker_order),
  sol: structuredClone(default_maker_order),
};
