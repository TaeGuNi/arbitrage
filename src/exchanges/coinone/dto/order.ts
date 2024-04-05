export default interface Order {
  id: string | undefined;
  coinone_order_id: string | undefined;
  bid_price: number;
  bid_qty: number;
}

export const default_order: Order = {
  id: undefined,
  coinone_order_id: undefined,
  bid_price: 0,
  bid_qty: 0,
};
