export default interface MakerOrder {
  id: string | undefined;
  coinone_order_id: string | undefined;
  upbit_order_id: string | undefined;
  bid_price: number;
  bid_qty: number;
}

export const default_maker_order: MakerOrder = {
  id: undefined,
  coinone_order_id: undefined,
  upbit_order_id: undefined,
  bid_price: 0,
  bid_qty: 0,
};
