import { v4 as uuidv4 } from "uuid";
import Orderbook from "./dto/orderbook";
import CoinoneRestApiClient from "../coinone/coinone-rest-api-client";
import Accounts, { default_accounts } from "./dto/accounts";
import UpbitRestApiClient from "../upbit/upbit-rest-api-client";
import Order from "./dto/order";
import { Symbol } from "./dto/symbol";
import AggregateOrderbook, {
  default_aggregate_orderbook,
} from "./dto/aggregate_orderbook";
import AggregateSide from "./dto/aggregate_side";
import { get_asking_price_unit, symbol_to_string, symbol_type } from "../utils";
import MakerOrders, { default_maker_orders } from "./dto/maker_orders";
import { OrderStatus } from "../coinone/dto/order_status";
import { reset, red, green, yellow, logger } from "../../logger";

export default class Exchange {
  private static _STATE: "STARING" | "READY" = "STARING";

  get state(): "STARING" | "READY" {
    return Exchange._STATE;
  }

  private static _ORDER_STATE: "TRADING" | "READY" = "READY";

  get order_state(): "TRADING" | "READY" {
    return Exchange._ORDER_STATE;
  }

  private readonly target: {
    ada: { profit: number; profit_rate: number };
    algo: { profit: number; profit_rate: number };
    atom: { profit: number; profit_rate: number };
    btc: { profit: number; profit_rate: number };
    doge: { profit: number; profit_rate: number };
    eth: { profit: number; profit_rate: number };
    matic: { profit: number; profit_rate: number };
    sol: { profit: number; profit_rate: number };
  };

  private maker_orders: MakerOrders = structuredClone(default_maker_orders);

  private readonly minimum_amount: number;

  // coinone
  private coinone_rest_api_client = new CoinoneRestApiClient();

  private readonly coinone_fee: number;

  private coinone_accounts: Accounts = structuredClone(default_accounts);

  // upbit
  private upbit_rest_api_client = new UpbitRestApiClient();

  private readonly upbit_fee: number;

  private upbit_accounts: Accounts = structuredClone(default_accounts);

  private aggregate_orderbook: AggregateOrderbook = structuredClone(
    default_aggregate_orderbook
  );

  constructor() {
    this.minimum_amount =
      process.env.MINIMUM_AMOUNT === undefined
        ? 5000
        : Number(process.env.MINIMUM_AMOUNT);

    this.coinone_fee =
      process.env.COINONE_FEE === undefined
        ? 0.002
        : Number(process.env.COINONE_FEE);

    this.upbit_fee =
      process.env.UPBIT_FEE === undefined
        ? 0.0005
        : Number(process.env.UPBIT_FEE);

    this.target = {
      ada: {
        profit:
          process.env.TARGET_ADA_PROFIT === undefined
            ? 500
            : Number(process.env.TARGET_ADA_PROFIT),
        profit_rate:
          process.env.TARGET_ADA_PROFIT_RATE === undefined
            ? 0.25
            : Number(process.env.TARGET_ADA_PROFIT_RATE),
      },
      algo: {
        profit:
          process.env.TARGET_ALGO_PROFIT === undefined
            ? 500
            : Number(process.env.TARGET_ALGO_PROFIT),
        profit_rate:
          process.env.TARGET_ALGO_PROFIT_RATE === undefined
            ? 0.25
            : Number(process.env.TARGET_ALGO_PROFIT_RATE),
      },
      atom: {
        profit:
          process.env.TARGET_ATOM_PROFIT === undefined
            ? 500
            : Number(process.env.TARGET_ATOM_PROFIT),
        profit_rate:
          process.env.TARGET_ATOM_PROFIT_RATE === undefined
            ? 0.25
            : Number(process.env.TARGET_ATOM_PROFIT_RATE),
      },
      btc: {
        profit:
          process.env.TARGET_BTC_PROFIT === undefined
            ? 500
            : Number(process.env.TARGET_BTC_PROFIT),
        profit_rate:
          process.env.TARGET_BTC_PROFIT_RATE === undefined
            ? 0.25
            : Number(process.env.TARGET_BTC_PROFIT_RATE),
      },
      doge: {
        profit:
          process.env.TARGET_DOGE_PROFIT === undefined
            ? 500
            : Number(process.env.TARGET_DOGE_PROFIT),
        profit_rate:
          process.env.TARGET_DOGE_PROFIT_RATE === undefined
            ? 0.25
            : Number(process.env.TARGET_DOGE_PROFIT_RATE),
      },
      eth: {
        profit:
          process.env.TARGET_ETH_PROFIT === undefined
            ? 500
            : Number(process.env.TARGET_ETH_PROFIT),
        profit_rate:
          process.env.TARGET_ETH_PROFIT_RATE === undefined
            ? 0.25
            : Number(process.env.TARGET_ETH_PROFIT_RATE),
      },
      matic: {
        profit:
          process.env.TARGET_MATIC_PROFIT === undefined
            ? 500
            : Number(process.env.TARGET_MATIC_PROFIT),
        profit_rate:
          process.env.TARGET_MATIC_PROFIT_RATE === undefined
            ? 0.25
            : Number(process.env.TARGET_MATIC_PROFIT_RATE),
      },
      sol: {
        profit:
          process.env.TARGET_SOL_PROFIT === undefined
            ? 500
            : Number(process.env.TARGET_SOL_PROFIT),
        profit_rate:
          process.env.TARGET_SOL_PROFIT_RATE === undefined
            ? 0.25
            : Number(process.env.TARGET_SOL_PROFIT_RATE),
      },
    };
    this.init();
  }

  update(ob: Orderbook) {
    try {
      // logger.info(ob);
      const s: symbol_type = symbol_to_string(ob.target_currency);
      if (s !== "krw") {
        const ex: "coinone" | "upbit" = ob.exchange.toLowerCase() as
          | "coinone"
          | "upbit";
        const t: "ask" | "bid" = ob.type.toLowerCase() as "ask" | "bid";

        this.aggregate_orderbook[ex][s][t] = {
          date: ob.date,
          price: Number(ob.price),
          qty: Number(ob.qty),
        };

        // this.check_order(ob.target_currency);
        this.maker_strategy(ob.target_currency);
      }
    } catch (error) {
      logger.error("%s", error);
      throw new Error("initialize failed");
    }
  }

  async init(): Promise<void> {
    Exchange._STATE = "READY";
  }

  async update_accounts(): Promise<void> {
    this.coinone_accounts = await this.coinone_rest_api_client.accounts();
    this.upbit_accounts = await this.upbit_rest_api_client.accounts();
  }

  async check_order(symbol: Symbol): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const s: symbol_type = symbol_to_string(symbol);
      if (s !== "krw") {
        const coinone: AggregateSide = this.aggregate_orderbook.coinone[s];
        const upbit: AggregateSide = this.aggregate_orderbook.upbit[s];

        if (
          coinone.ask.price > 0 &&
          coinone.bid.price > 0 &&
          upbit.ask.price > 0 &&
          upbit.bid.price > 0 &&
          coinone.ask.date > Date.now() - 500 &&
          coinone.bid.date > Date.now() - 500 &&
          upbit.ask.date > Date.now() - 500 &&
          upbit.bid.date > Date.now() - 500
        ) {
          const available_qty: number =
            Math.floor(
              (upbit.bid.qty > coinone.ask.qty
                ? coinone.ask.qty
                : upbit.bid.qty) *
                0.995 *
                10000
            ) / 10000;
          let profit: number = 0;
          if (coinone.bid.price > upbit.ask.price) {
            // TODO
          } else if (upbit.bid.price > coinone.ask.price) {
            const upbit_amount: number =
              upbit.bid.price * available_qty -
              upbit.bid.price * available_qty * this.upbit_fee;
            const coinone_amount: number =
              coinone.ask.price * available_qty +
              coinone.ask.price * available_qty * this.coinone_fee;
            profit = upbit_amount - coinone_amount;
            profit = profit > 0 ? Math.floor(profit) : Math.ceil(profit);

            if (Exchange._ORDER_STATE === "READY") {
              if (Math.abs(coinone.ask.date - upbit.bid.date) <= 500) {
                const price_compare_rate: number =
                  Math.floor(
                    (1 - coinone.ask.price / upbit.bid.price) * 10000
                  ) / 100;

                logger.debug(
                  "================================================"
                );
                logger.debug(`Upbit SELL Coinone BUY ${symbol}`);
                logger.debug(
                  `Upbit                  ${symbol}: ${upbit.bid.price}`
                );
                logger.debug(
                  `Coinone                ${symbol}: ${coinone.ask.price}`
                );
                logger.debug(`profit:                ${symbol}: ${profit}`);
                logger.debug(
                  `profit rate:           ${symbol}: ${price_compare_rate} %`
                );
                logger.debug(
                  `available_qty          ${symbol}: ${available_qty}`
                );
                if (
                  profit > this.target[s].profit &&
                  price_compare_rate > this.target[s].profit_rate
                ) {
                  this.make_order(
                    "USCB",
                    symbol,
                    coinone.ask.price,
                    upbit.bid.price,
                    available_qty
                  );
                }
              }
            }
          }
        }
      }
      resolve();
    });
  }

  async make_order(
    type: "USCB" | "CSUB",
    symbol: Symbol,
    coinone_price: number,
    upbit_price: number,
    qty: number
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (coinone_price <= 0)
        reject(new Error("invalid value: coinone_btc_price"));
      if (upbit_price <= 0) reject(new Error("invalid value: upbit_btc_price"));
      if (qty <= 0) reject(new Error("invalid value: qty"));

      if (Exchange._ORDER_STATE !== "TRADING") {
        Exchange._ORDER_STATE = "TRADING";

        await this.update_accounts();

        try {
          const s: symbol_type = symbol_to_string(symbol);
          if (type === "USCB") {
            // upbit sell (ask) & coinone buy (bid)
            const coinone_available_qty: number =
              Math.floor(
                (this.coinone_accounts.krw.available / coinone_price) * 1000
              ) / 1000;
            logger.debug(
              `coinone_available_qty: ${coinone_available_qty.toFixed(8)}`
            );

            const upbit_available_qty: number =
              this.upbit_accounts[s].available;
            logger.debug(
              `upbit_available_qty: ${upbit_available_qty.toFixed(8)}`
            );

            let last_qty: number =
              coinone_available_qty > upbit_available_qty
                ? upbit_available_qty
                : coinone_available_qty;
            last_qty =
              qty < last_qty
                ? Math.floor(qty * 0.995 * 10000) / 10000
                : last_qty;

            if (
              0.0001 < last_qty &&
              coinone_price * last_qty > 500 &&
              upbit_price * last_qty > 500
            ) {
              logger.debug("===================");
              logger.debug("= uscb_make_order =");
              logger.debug(`symbol:        ${symbol}`);
              logger.debug(`coinone_price: ${coinone_price}`);
              logger.debug(`upbit_price:   ${upbit_price}`);
              logger.debug(`last_qty:      ${last_qty}`);
              logger.debug("===================");
              await this.uscb_make_order(
                symbol,
                coinone_price,
                upbit_price,
                last_qty
              );
            }
          } else if (type === "CSUB") {
            // coinone sell (ask) & upbit buy (bid)
            logger.warn("No impliments ===================");
          } else {
            reject(new Error("type error" + type));
          }
        } catch (error) {
          reject(error);
        }

        Exchange._ORDER_STATE = "READY";
      }
      resolve();
    });
  }

  async uscb_make_order(
    symbol: Symbol,
    coinone_price: number,
    upbit_price: number,
    qty: number
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const user_order_id = uuidv4();
      // coinone
      const coinone_make_order: Order =
        await this.coinone_rest_api_client.make_order(
          "bid",
          user_order_id,
          symbol,
          coinone_price,
          qty
        );
      logger.info("coinone ============");
      logger.info(coinone_make_order);
      // const coinone_get_order: Order =
      //   await this.coinone_rest_api_client.get_order(
      //     symbol,
      //     coinone_make_order.order_id,
      //     coinone_make_order.user_order_id
      //   );
      // logger.info(coinone_get_order);
      // upbit
      const upbit_make_order: Order =
        await this.upbit_rest_api_client.make_order(
          "ask",
          user_order_id,
          symbol,
          upbit_price,
          qty
        );
      logger.info("upbit =============");
      logger.info(upbit_make_order);
      // const upbit_get_order: Order = await this.upbit_rest_api_client.get_order(
      //   symbol,
      //   upbit_make_order.order_id,
      //   upbit_make_order.user_order_id
      // );
      // logger.info(upbit_get_order);

      resolve();
    });
  }

  async maker_strategy(symbol: Symbol): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const s: symbol_type = symbol_to_string(symbol);
      if (s !== "krw") {
        const coinone: AggregateSide = this.aggregate_orderbook.coinone[s];
        const upbit: AggregateSide = this.aggregate_orderbook.upbit[s];

        if (
          coinone.ask.price > 0 &&
          coinone.bid.price > 0 &&
          upbit.ask.price > 0 &&
          upbit.bid.price > 0 &&
          coinone.ask.date > Date.now() - 500 &&
          coinone.bid.date > Date.now() - 500 &&
          upbit.ask.date > Date.now() - 500 &&
          upbit.bid.date > Date.now() - 500
        ) {
          const coinone_bid = coinone.bid;
          const coinone_bid_price: number = coinone_bid.price; //- get_asking_price_unit(symbol);
          logger.debug(
            `coinone_bid_price:     ${green}${symbol} ${yellow}${coinone_bid_price}${reset}`
          );
          const upbit_bid = upbit.bid;
          const upbit_bid_price: number = upbit_bid.price; //- get_asking_price_unit(symbol);
          logger.debug(
            `upbit_bid_price:       ${green}${symbol} ${yellow}${upbit_bid_price}${reset}`
          );

          const bid_qty: number =
            Math.ceil((this.minimum_amount / coinone_bid_price) * 100000) /
            100000;

          const profit: number =
            upbit_bid_price * bid_qty * (1 - this.upbit_fee) -
            coinone_bid_price * bid_qty * (1 + this.coinone_fee);
          logger.debug(
            `profit:                ${green}${symbol} ${red}${profit}${reset}`
          );

          if (
            profit > 0 &&
            upbit_bid_price > (coinone_bid_price + profit) * 0.0001 &&
            this.maker_orders[s].id === undefined &&
            this.maker_orders[s].coinone_order_id === undefined
          ) {
            const order_id: string = uuidv4();
            this.maker_orders[s].id = order_id;
            try {
              await this.update_accounts();
              if (
                this.coinone_accounts.krw.available > this.minimum_amount &&
                this.upbit_accounts[s].available >= bid_qty
              ) {
                logger.debug(
                  `NEW Order ${s}: ${coinone_bid_price} * ${bid_qty} = ${
                    coinone_bid_price * bid_qty
                  }`
                );

                const make_order =
                  await this.coinone_rest_api_client.make_order(
                    "bid",
                    order_id,
                    symbol,
                    coinone_bid_price,
                    bid_qty
                  );

                this.maker_orders[s] = {
                  id: order_id,
                  coinone_order_id: make_order.order_id,
                  upbit_order_id: undefined,
                  bid_price: coinone_bid_price,
                  bid_qty: bid_qty,
                };
                this.watch_order(symbol);
              } else {
                this.maker_orders[s] = {
                  id: undefined,
                  coinone_order_id: undefined,
                  upbit_order_id: undefined,
                  bid_price: 0,
                  bid_qty: 0,
                };
              }
            } catch (error) {
              logger.error(error);
              this.maker_orders[s] = {
                id: undefined,
                coinone_order_id: undefined,
                upbit_order_id: undefined,
                bid_price: 0,
                bid_qty: 0,
              };
            }
          }
        }
      }
      resolve();
    });
  }

  async watch_order(symbol: Symbol): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const interval = setInterval(() => {}, 500);
      const s: symbol_type = symbol_to_string(symbol);
      if (
        s !== "krw" &&
        (this.maker_orders[s].coinone_order_id !== undefined ||
          this.maker_orders[s].id !== undefined)
      ) {
        logger.debug(
          "WATCH Order ================================================"
        );
        const coinone: AggregateSide = this.aggregate_orderbook.coinone[s];
        const upbit: AggregateSide = this.aggregate_orderbook.upbit[s];
        const coinone_bid = coinone.bid;
        const coinone_bid_price: number = coinone_bid.price; //- get_asking_price_unit(symbol);
        logger.debug(`coinone_bid_price:     ${symbol} ${coinone_bid_price}`);
        const upbit_bid = upbit.bid;
        const upbit_bid_price: number = upbit_bid.price; //- get_asking_price_unit(symbol);

        try {
          const order: Order = await this.coinone_rest_api_client.get_order(
            symbol,
            this.maker_orders[s].coinone_order_id,
            this.maker_orders[s].id
          );
          logger.debug(
            "GET Order =================================================="
          );
          logger.debug(`GET Order:             ${order.response.result}`);
          logger.debug(`status:                ${order.response.order.status}`);

          const profit: number =
            upbit_bid_price *
              this.maker_orders[s].bid_qty *
              (1 - this.upbit_fee) -
            coinone_bid_price *
              this.maker_orders[s].bid_qty *
              (1 + this.coinone_fee);
          logger.debug(`profit:                ${symbol} ${profit}`);

          const coinone_order_status: OrderStatus =
            OrderStatus[
              order.response.order.status as keyof typeof OrderStatus
            ];
          logger.debug(
            `coinone ${symbol} order status:  ${coinone_order_status}`
          );
          const asking_price_unit: number =
            get_asking_price_unit(symbol) < 1
              ? 10
              : get_asking_price_unit(symbol);
          switch (coinone_order_status) {
            case OrderStatus.LIVE:
              if (
                this.maker_orders[s].bid_price < coinone_bid_price ||
                profit <= 0 ||
                upbit_bid_price < (coinone_bid_price + profit) * 0.0001
              ) {
                const delete_order: Order =
                  await this.coinone_rest_api_client.delete_order(
                    symbol,
                    this.maker_orders[s].coinone_order_id,
                    this.maker_orders[s].id
                  );
                logger.debug(
                  "DELETE Order ==============================================="
                );
                logger.debug(
                  `DELETE Order:          ${delete_order.response.result}`
                );
                this.maker_orders[s] = {
                  id: undefined,
                  coinone_order_id: undefined,
                  upbit_order_id: undefined,
                  bid_price: 0,
                  bid_qty: 0,
                };
              } else {
                this.watch_order(symbol);
              }
              break;
            case OrderStatus.FILLED:
              const ask_price: number =
                Math.ceil(
                  (Number(order.response.order.price) * 1.0026) /
                    asking_price_unit
                ) * asking_price_unit;

              logger.debug(`ask_price              ${symbol} ${ask_price}`);
              const asking_order: Order =
                await this.upbit_rest_api_client.make_order(
                  "ask",
                  this.maker_orders[s].id,
                  symbol,
                  ask_price,
                  this.maker_orders[s].bid_qty
                );
              logger.debug(
                "ASKING Order ==============================================="
              );
              logger.debug(
                `upbit order id:        ${asking_order.response.uuid}`
              );
              logger.debug(
                `ASKING Order           ${s}: ${ask_price}` +
                  ` * ${this.maker_orders[s].bid_qty}` +
                  ` = ${ask_price * this.maker_orders[s].bid_qty}`
              );
              this.maker_orders[s] = {
                id: undefined,
                coinone_order_id: undefined,
                upbit_order_id: undefined,
                bid_price: 0,
                bid_qty: 0,
              };
              break;
            case OrderStatus.PARTIALLY_FILLED:
              if (
                Number(order.response.order.price) *
                  Number(order.response.order.executed_qty) >
                  5000 &&
                Number(order.response.order.price) <
                  this.aggregate_orderbook.coinone[s].bid.price
              ) {
                const delete_order: Order =
                  await this.coinone_rest_api_client.delete_order(
                    symbol,
                    this.maker_orders[s].coinone_order_id,
                    this.maker_orders[s].id
                  );
                logger.debug(
                  "DELETE Order ==============================================="
                );
                logger.debug(
                  `DELETE Order:          ${delete_order.response.result}`
                );
                if (delete_order.response.result === "success") {
                  const ask_price: number =
                    Math.ceil(
                      (Number(order.response.order.price) * 1.0026) /
                        asking_price_unit
                    ) * asking_price_unit;

                  logger.debug(`ask_price              ${symbol} ${ask_price}`);
                  const asking_order: Order =
                    await this.upbit_rest_api_client.make_order(
                      "ask",
                      this.maker_orders[s].id,
                      symbol,
                      ask_price,
                      Number(order.response.order.traded_qty)
                    );
                  logger.debug(
                    "ASKING Order ==============================================="
                  );
                  logger.debug(
                    `upbit order id:        ${asking_order.response.uuid}`
                  );
                  logger.debug(
                    `ASKING Order           ${s}: ${ask_price}` +
                      ` * ${this.maker_orders[s].bid_qty}` +
                      ` = ${ask_price * this.maker_orders[s].bid_qty}`
                  );
                  this.maker_orders[s] = {
                    id: undefined,
                    coinone_order_id: undefined,
                    upbit_order_id: undefined,
                    bid_price: 0,
                    bid_qty: 0,
                  };
                }
              } else {
                this.watch_order(symbol);
              }
              break;
            default:
              this.watch_order(symbol);
              break;
          }
        } catch (error) {
          logger.error(error);
          this.watch_order(symbol);
        }
      }
      resolve();
    });
  }
}
