import AggregateExchange, {
  default_aggregate_exchange,
} from "./aggregate_exchange";

export default interface AggregateOrderbook {
  coinone: AggregateExchange;
  upbit: AggregateExchange;
}

export const default_aggregate_orderbook: AggregateOrderbook = {
  coinone: structuredClone(default_aggregate_exchange),
  upbit: structuredClone(default_aggregate_exchange),
};
