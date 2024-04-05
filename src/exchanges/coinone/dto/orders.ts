import Order, { default_order } from "./order";

export default interface Orders {
  ada: Order;
  algo: Order;
  atom: Order;
  btc: Order;
  doge: Order;
  eth: Order;
  matic: Order;
  sol: Order;
}

export const default_orders: Orders = {
  ada: structuredClone(default_order),
  algo: structuredClone(default_order),
  atom: structuredClone(default_order),
  btc: structuredClone(default_order),
  doge: structuredClone(default_order),
  eth: structuredClone(default_order),
  matic: structuredClone(default_order),
  sol: structuredClone(default_order),
};
