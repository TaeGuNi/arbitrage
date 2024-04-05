import AggregateSide, { default_aggregate_side } from "./aggregate_side";

export default interface AggregateExchange {
  ada: AggregateSide;
  algo: AggregateSide;
  atom: AggregateSide;
  btc: AggregateSide;
  doge: AggregateSide;
  eth: AggregateSide;
  matic: AggregateSide;
  sol: AggregateSide;
}

export const default_aggregate_exchange: AggregateExchange = {
  ada: structuredClone(default_aggregate_side),
  algo: structuredClone(default_aggregate_side),
  atom: structuredClone(default_aggregate_side),
  btc: structuredClone(default_aggregate_side),
  doge: structuredClone(default_aggregate_side),
  eth: structuredClone(default_aggregate_side),
  sol: structuredClone(default_aggregate_side),
  matic: structuredClone(default_aggregate_side),
};
