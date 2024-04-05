import * as request from "request";
import { CoreOptions } from "request";
import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";
import Accounts, { default_accounts } from "../aggregate/dto/accounts";
import Order from "../aggregate/dto/order";
import { Symbol } from "../aggregate/dto/symbol";
import { symbol_to_string, symbol_type } from "../utils";
import { error_code } from "./dto/error_code";
import { logger } from "../../logger";

export default class CoinoneRestApiClient {
  private readonly access_key: string | undefined;

  private readonly secret_key: string | undefined;

  private readonly url: string = "https://api.coinone.co.kr";

  constructor() {
    this.access_key = process.env.COINONE_ACCESS_KEY;
    this.secret_key = process.env.COINONE_SECRET_KEY;
  }

  /**
   * set_options
   *
   * @param payload {}
   * @returns {CoreOptions}
   */
  set_options(payload: any): CoreOptions {
    if (this.access_key === undefined || this.secret_key === undefined)
      throw new Error("undefied key");
    Object.assign(payload, { access_token: this.access_key });
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      "base64"
    );
    const signature = crypto
      .createHmac("sha512", this.secret_key)
      .update(encodedPayload)
      .digest("hex");
    return {
      headers: {
        "Content-Type": "application/json",
        "X-COINONE-PAYLOAD": encodedPayload,
        "X-COINONE-SIGNATURE": signature,
      },
      body: JSON.stringify(payload),
    };
  }

  /**
   * accounts
   *
   * @returns {Promise<Accounts>}
   */
  async accounts(): Promise<Accounts> {
    return new Promise((resolve, reject) => {
      const payload = {
        nonce: uuidv4(),
      };
      const options = this.set_options(payload);
      request.post(
        this.url + "/v2.1/account/balance/all",
        options,
        (error, response, body) => {
          if (error) reject(new Error(error));

          const json = JSON.parse(body);

          if (json.result !== "success" || json.error_code !== "0") {
            const message =
              "result: " + json.result + ", error_code:" + json.error_code;
            logger.error(message);
            if (error_code.hasOwnProperty(json.error_code)) {
              logger.error(
                error_code[json.error_code as keyof typeof error_code].message
              );
              logger.error(
                error_code[json.error_code as keyof typeof error_code]
                  .description
              );
              logger.debug(JSON.stringify(options));
            }
            reject(new Error(message));
          } else {
            const accounts: Accounts = structuredClone(default_accounts);

            for (let i = 0; i < Object.keys(json.balances).length; i++) {
              if (Object.keys(Symbol).includes(json.balances[i].currency)) {
                const available = Number(json.balances[i].available);
                const locked = Number(json.balances[i].limit);
                const symbol: symbol_type = symbol_to_string(
                  json.balances[i].currency
                );
                accounts[symbol] = {
                  balance: available + locked,
                  available: available,
                  locked: locked,
                };
              }
            }
            resolve(accounts);
          }
        }
      );
    });
  }

  /**
   * make_order
   *
   * @param side 'ask' | 'bid'
   * @param user_order_id uuidv4
   * @param symbol {Symbol}
   * @param price number > 0
   * @param qty number > 0
   * @returns {Promise<Order>}
   */
  async make_order(
    side: "ask" | "bid",
    user_order_id: string,
    symbol: Symbol,
    price: number,
    qty: number
  ): Promise<Order> {
    return new Promise((resolve, reject) => {
      if (price <= 0) reject(new Error("invalid price"));
      if (qty <= 0) reject(new Error("invalid qty"));

      const payload = {
        nonce: uuidv4(),
        quote_currency: "KRW",
        target_currency: symbol.toString().toUpperCase(),
        type: "LIMIT",
        side: side === "ask" ? "SELL" : "BUY",
        price: price,
        qty: qty,
        post_only: false,
      };

      if (user_order_id !== undefined) {
        Object.assign(payload, { user_order_id: user_order_id });
      }
      const options = this.set_options(payload);
      request.post(
        this.url + "/v2.1/order",
        options,
        (error, response, body) => {
          if (error) reject(new Error(error));

          const json = JSON.parse(body);

          if (json.result !== "success" || json.error_code !== "0") {
            let message =
              "result: " + json.result + ", error_code:" + json.error_code;
            logger.error(message);
            if (error_code.hasOwnProperty(json.error_code)) {
              logger.error(
                error_code[json.error_code as keyof typeof error_code].message
              );
              logger.error(
                error_code[json.error_code as keyof typeof error_code]
                  .description
              );
              logger.debug(JSON.stringify(options));
            }
            reject(new Error(message));
          } else {
            resolve({
              order_id: json.order_id,
              user_order_id: user_order_id,
              symbol: symbol,
              response: json,
            });
          }
        }
      );
    });
  }

  async get_order(
    symbol: Symbol,
    order_id?: string | undefined,
    user_order_id?: string | undefined
  ): Promise<Order> {
    return new Promise((resolve, reject) => {
      if (order_id === undefined && user_order_id === undefined)
        reject(new Error("required order_id or user_order_id"));

      const payload = {
        nonce: uuidv4(),
        quote_currency: "KRW",
        target_currency: symbol.toString().toUpperCase(),
      };
      if (order_id !== undefined) {
        Object.assign(payload, { order_id: order_id });
      }

      if (order_id === undefined && user_order_id !== undefined) {
        Object.assign(payload, { user_order_id: user_order_id });
      }

      const options = this.set_options(payload);

      request.post(
        this.url + "/v2.1/order/detail",
        options,
        (error, response, body) => {
          if (error) reject(new Error(error));
          const json = JSON.parse(body);

          if (json.result !== "success" || json.error_code !== "0") {
            const message =
              "result: " + json.result + ", error_code:" + json.error_code;
            logger.error(message);
            if (error_code.hasOwnProperty(json.error_code)) {
              logger.error(
                error_code[json.error_code as keyof typeof error_code].message
              );
              logger.error(
                error_code[json.error_code as keyof typeof error_code]
                  .description
              );
              logger.debug(JSON.stringify(options));
            }
            reject(new Error(message));
          } else {
            resolve({
              order_id: json.order_id,
              user_order_id: user_order_id,
              symbol: symbol,
              response: json,
            });
          }
        }
      );
    });
  }

  async delete_order(
    symbol: Symbol,
    order_id?: string | undefined,
    user_order_id?: string | undefined
  ): Promise<Order> {
    return new Promise((resolve, reject) => {
      if (order_id === undefined && user_order_id === undefined)
        reject(new Error("required order_id or user_order_id"));

      const payload = {
        nonce: uuidv4(),
        quote_currency: "KRW",
        target_currency: symbol.toString().toUpperCase(),
      };
      if (order_id !== undefined) {
        Object.assign(payload, { order_id: order_id });
      }

      if (order_id === undefined && user_order_id !== undefined) {
        Object.assign(payload, { user_order_id: user_order_id });
      }

      const options = this.set_options(payload);

      request.post(
        this.url + "/v2.1/order/cancel",
        options,
        (error, response, body) => {
          if (error) reject(new Error(error));
          const json = JSON.parse(body);

          if (json.result !== "success" || json.error_code !== "0") {
            const message =
              "result: " + json.result + ", error_code:" + json.error_code;
            logger.error(message);
            if (error_code.hasOwnProperty(json.error_code)) {
              logger.error(
                error_code[json.error_code as keyof typeof error_code].message
              );
              logger.error(
                error_code[json.error_code as keyof typeof error_code]
                  .description
              );
              logger.debug(JSON.stringify(options));
            }
            reject(new Error(message));
          } else {
            resolve({
              order_id: json.order_id,
              user_order_id: user_order_id,
              symbol: symbol,
              response: json,
            });
          }
        }
      );
    });
  }

  async delete_all_order(symbol: Symbol): Promise<number> {
    return new Promise((resolve, reject) => {
      const payload = {
        nonce: uuidv4(),
        quote_currency: "KRW",
        target_currency: symbol.toString().toUpperCase(),
      };
      const options = this.set_options(payload);

      request.post(
        this.url + "/v2.1/order/cancel/all",
        options,
        (error, response, body) => {
          if (error) reject(new Error(error));
          const json = JSON.parse(body);

          if (json.result !== "success" || json.error_code !== "0") {
            const message =
              "result: " + json.result + ", error_code:" + json.error_code;
            logger.error(message);
            if (error_code.hasOwnProperty(json.error_code)) {
              logger.error(
                error_code[json.error_code as keyof typeof error_code].message
              );
              logger.error(
                error_code[json.error_code as keyof typeof error_code]
                  .description
              );
              logger.debug(JSON.stringify(options));
            }
            reject(new Error(message));
          } else {
            resolve(json.canceled_count);
          }
        }
      );
    });
  }
}
