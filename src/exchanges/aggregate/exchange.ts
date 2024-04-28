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

        if (ob.type === "BID") {
          this.maker_strategy(ob.target_currency);
        }
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
          upbit.bid.date > Date.now() - 500 &&
          this.maker_orders[s].id === undefined &&
          this.maker_orders[s].coinone_order_id === undefined
        ) {
          const coinone_ask_price: number = coinone.ask.price;
          logger.debug(
            `coinone_ask_price:     ${green}${symbol} ${yellow}${coinone_ask_price}${reset}`
          );
          const coinone_bid_price: number = coinone.bid.price; //- get_asking_price_unit(symbol);
          logger.debug(
            `coinone_bid_price:     ${green}${symbol} ${yellow}${coinone_bid_price}${reset}`
          );
          const upbit_bid_price: number = upbit.bid.price; //- get_asking_price_unit(symbol);
          logger.debug(
            `upbit_bid_price:       ${green}${symbol} ${yellow}${upbit_bid_price}${reset}`
          );

          await this.update_accounts();

          Math.floor(
            (this.coinone_accounts.krw.available / coinone_ask_price) * 100000
          ) / 100000;

          let bid_qty: number =
            Math.floor(
              (this.coinone_accounts.krw.available / coinone_ask_price) * 100000
            ) / 100000;
          const available_qty: number =
            coinone.ask.qty > upbit.bid.qty ? upbit.bid.qty : coinone.ask.qty;

          let coinone_order_price: number = 0;

          bid_qty = bid_qty < available_qty ? bid_qty : available_qty;

          let profit: number =
            upbit_bid_price * bid_qty * (1 - this.upbit_fee) -
            coinone_ask_price * bid_qty * (1 + this.coinone_fee);
          if (
            profit > 0 &&
            upbit_bid_price > (coinone_bid_price + profit) * 0.0001
          ) {
            coinone_order_price = coinone_ask_price;
            logger.debug(
              `ask profit:            ${green}${symbol} ${red}${profit}${reset}`
            );
          } else {
            coinone_order_price = coinone_bid_price;
            bid_qty =
              Math.ceil((this.minimum_amount / coinone_bid_price) * 100000) /
              100000;
            profit =
              upbit_bid_price * bid_qty * (1 - this.upbit_fee) -
              coinone_bid_price * bid_qty * (1 + this.coinone_fee);
            logger.debug(
              `bid profit:            ${green}${symbol} ${red}${profit}${reset}`
            );
          }

          if (
            coinone_order_price > 0 &&
            profit > 0 &&
            upbit_bid_price >= (coinone_bid_price + profit) * 0.0001
          ) {
            const order_id: string = uuidv4();
            this.maker_orders[s].id = order_id;
            try {
              if (
                this.coinone_accounts.krw.available > this.minimum_amount &&
                this.upbit_accounts[s].available >= bid_qty
              ) {
                logger.debug(
                  `NEW Order ${s}: ${coinone_order_price} * ${bid_qty} = ${
                    coinone_order_price * bid_qty
                  }`
                );

                const make_order =
                  await this.coinone_rest_api_client.make_order(
                    "bid",
                    order_id,
                    symbol,
                    coinone_order_price,
                    bid_qty
                  );

                this.maker_orders[s] = {
                  id: order_id,
                  coinone_order_id: make_order.order_id,
                  upbit_order_id: undefined,
                  bid_price: coinone_order_price,
                  bid_qty: bid_qty,
                };
                this.delay_watch_coinone_order(symbol);
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

  async watch_coinone_order(symbol: Symbol): Promise<void> {
    return new Promise(async (resolve, reject) => {
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
                this.delay_watch_coinone_order(symbol);
              }
              break;
            case OrderStatus.FILLED:
              await this.upbit_order(symbol);
              break;
            case OrderStatus.CANCELED:
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
                try {
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
                    const qty: number = Number(order.response.order.traded_qty);
                    await this.upbit_order(symbol, qty);
                  } else {
                    this.delay_watch_coinone_order(symbol);
                  }
                } catch (error) {
                  logger.debug("Failed Delete order");
                  logger.error(error);
                }
              } else {
                this.delay_watch_coinone_order(symbol);
              }
              break;
            case OrderStatus.PARTIALLY_CANCELED:
              const qty: number = Number(order.response.order.traded_qty);
              await this.upbit_order(symbol, qty);
              break;
            default:
              this.delay_watch_coinone_order(symbol);
              break;
          }
        } catch (error) {
          logger.error(error);
          this.delay_watch_coinone_order(symbol);
        }
      }
      resolve();
    });
  }

  delay_watch_coinone_order(symbol: Symbol): void {
    const timeout = setTimeout(() => {
      this.watch_coinone_order(symbol);
      clearTimeout(timeout);
    }, 500);
  }

  async upbit_order(symbol: Symbol, qty?: number | undefined): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const s: symbol_type = symbol_to_string(symbol);

      const asking_price_unit: number =
        get_asking_price_unit(symbol) < 1 ? 10 : get_asking_price_unit(symbol);

      if (
        s !== "krw" &&
        (this.maker_orders[s].coinone_order_id !== undefined ||
          this.maker_orders[s].id !== undefined)
      ) {
        let ask_price: number =
          Math.ceil(
            (Number(this.maker_orders[s].bid_price) * 1.0026) /
              asking_price_unit
          ) * asking_price_unit;

        if (
          ask_price < this.aggregate_orderbook.upbit[s].bid.price &&
          this.aggregate_orderbook.upbit[s].bid.date > Date.now() - 500
        ) {
          ask_price = this.aggregate_orderbook.upbit[s].bid.price;
        }

        logger.debug(`ask_price              ${symbol} ${ask_price}`);
        try {
          const asking_order: Order =
            await this.upbit_rest_api_client.make_order(
              "ask",
              this.maker_orders[s].id,
              symbol,
              ask_price,
              qty === undefined ? this.maker_orders[s].bid_qty : qty
            );
          logger.debug(
            "ASKING Order ==============================================="
          );
          logger.debug(`upbit order id:        ${asking_order.response.uuid}`);
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
        } catch (error) {
          logger.debug("Error from Upbit");
          logger.error(error);
          reject(error);
        }
      }
      resolve();
    });
  }
}
