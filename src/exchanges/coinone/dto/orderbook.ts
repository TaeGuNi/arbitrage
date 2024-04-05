import Data from "./data";

export default interface Orderbook {
  response_type: "DATA";
  channel: "ORDERBOOK";
  data: Data;
}
