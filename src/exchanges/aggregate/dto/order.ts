import { Symbol } from "./symbol";

export default interface Order {
  order_id?: string | undefined;
  user_order_id?: string | undefined;
  symbol?: Symbol | undefined;
  response?: any | undefined;
}
