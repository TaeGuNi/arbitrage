import Price, { default_price } from "./price";

export default interface AggregateSide {
  ask: Price;
  bid: Price;
}

export const default_aggregate_side: AggregateSide = {
  ask: structuredClone(default_price),
  bid: structuredClone(default_price),
};
