import { config } from "dotenv";
import CoinoneRestApiClient from "./exchanges/coinone/coinone-rest-api-client";
import UpbitRestApiClient from "./exchanges/upbit/upbit-rest-api-client";
import { logger } from "./logger";

config();

/**
 * coinone test
 */
const coinone = async () => {
  const client = new CoinoneRestApiClient();
  const accounts = await client.accounts();
  logger.info(accounts);
  // const make_order = await client.make_order(
  //   "bid",
  //   Symbol.BTC,
  //   50000000,
  //   0.0001
  // );
  // logger.info(make_order);
  // const get_order = await client.get_order(
  //   Symbol.BTC,
  //   make_order.order_id,
  //   make_order.user_order_id
  // );
  // logger.info(get_order);
  // const delete_order = await client.delete_order(
  //   Symbol.BTC,
  //   make_order.order_id,
  //   make_order.user_order_id
  // );
  // logger.info(delete_order);
};
coinone();

/**
 * upbit test
 */
const upbit = async () => {
  const client = new UpbitRestApiClient();
  let accounts = await client.accounts();
  logger.info(accounts);
  // const make_order = await client.make_order(
  //   "bid",
  //   Symbol.BTC,
  //   50000000,
  //   0.0001
  // );
  // logger.info(make_order);
  // accounts = await client.accounts();
  // logger.info(accounts);
  // const get_order = await client.get_order(
  //   Symbol.BTC,
  //   make_order.order_id,
  //   make_order.user_order_id
  // );
  // logger.info(get_order);
  // const delete_order = await client.delete_order(
  //   Symbol.BTC,
  //   make_order.order_id,
  //   make_order.user_order_id
  // );
  // logger.info(delete_order);
};
upbit();
