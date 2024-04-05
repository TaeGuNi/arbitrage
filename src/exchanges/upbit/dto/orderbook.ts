import OrderbookUnit from "./orderbook_unit";

export default interface Orderbook {
  type: "orderbook";
  code: string;
  timestamp: number;
  total_ask_size: number;
  total_bid_size: number;
  orderbook_units: OrderbookUnit[];
  stream_type: "REALTIME";
}
