import * as request from "request";
import { CoreOptions } from "request";
import { v4 as uuidv4 } from "uuid";
import { sign } from "jsonwebtoken";
import * as crypto from "crypto";
import { encode } from "querystring";
import Accounts, { default_accounts } from "../aggregate/dto/accounts";
import Order from "../aggregate/dto/order";
import { Symbol } from "../aggregate/dto/symbol";
import { symbol_to_string, symbol_type } from "../utils";
import { logger } from "../../logger";

export default class UpbitRestApiClient {
  private readonly access_key: string | undefined;

  private readonly secret_key: string | undefined;

  private readonly url: string = "https://api.upbit.com";

  constructor() {
    this.access_key = process.env.UPBIT_ACCESS_KEY;
    this.secret_key = process.env.UPBIT_SECRET_KEY;
  }

  generate_token(payload: any): string {
    if (this.secret_key === undefined) throw new Error("undefied key");
    return sign(payload, this.secret_key);
  }

  set_options(body?: any): CoreOptions {
    if (this.access_key === undefined || this.secret_key === undefined)
      throw new Error("undefied key");
    const payload = {
      access_key: this.access_key,
      nonce: uuidv4(),
    };

    if (body !== null || body !== undefined) {
      const query: string = encode(body);
      const hash = crypto.createHash("sha512");
      const query_hash = hash.update(query, "utf-8").digest("hex");

      Object.assign(payload, {
        query_hash: query_hash,
        query_hash_alg: "SHA512",
      });
    }

    const options: CoreOptions = {
      headers: {
        Authorization: `Bearer ${this.generate_token(payload)}`,
        "Content-Type": "application/json",
      },
    };

    if (body !== null || body !== undefined) {
      Object.assign(options, { json: body });
    }

    return options;
  }

  /**
   * accounts
   *
   * @returns {Promise<Accounts>}
   */
  async accounts(): Promise<Accounts> {
    return new Promise((resolve, reject) => {
      const options = this.set_options();
      request.get(
        this.url + "/v1/accounts",
        options,
        (error, response, body) => {
          if (error) throw new Error(error);

          const accounts: Accounts = structuredClone(default_accounts);
          const json = JSON.parse(body);

          for (let i = 0; i < Object.keys(json).length - 1; i++) {
            if (Object.keys(Symbol).includes(json[i].currency)) {
              const available = Number(json[i].balance);
              const locked = Number(json[i].locked);
              const symbol: symbol_type = symbol_to_string(json[i].currency);

              accounts[symbol] = {
                balance: available + locked,
                available: available,
                locked: locked,
              };
            }
          }
          resolve(accounts);
        }
      );
    });
  }

  async make_order(
    side: "ask" | "bid",
    user_order_id: string | undefined,
    symbol: Symbol,
    price: number,
    qty: number
  ): Promise<Order> {
    return new Promise((resolve, reject) => {
      const body = {
        market: "KRW-" + symbol.toString().toUpperCase(),
        side: side,
        volume: qty.toString(),
        price: price.toString(),
        order_type: "limit",
      };

      if (user_order_id !== undefined) {
        Object.assign(body, { identifier: user_order_id });
      }

      const options = this.set_options(body);

      const endpoint: string = this.url + "/v1/orders";
      request.post(endpoint, options, (error, response, body) => {
        if (error) reject(new Error(error));

        resolve({
          order_id: body.uuid,
          user_order_id: user_order_id,
          symbol: symbol,
          response: body,
        });
      });
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

      const body = {};

      if (order_id !== undefined) {
        Object.assign(body, { uuid: order_id });
      }

      if (user_order_id !== undefined) {
        Object.assign(body, { identifier: user_order_id });
      }

      const options = this.set_options(body);

      request.get(
        this.url + "/v1/order?" + encode(body),
        options,
        (error, response, body) => {
          if (error) reject(new Error(error));

          resolve({
            order_id: body.uuid,
            user_order_id: user_order_id,
            symbol: symbol,
            response: body,
          });
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

      const body = {};

      if (order_id !== undefined) {
        Object.assign(body, { uuid: order_id });
      }

      if (user_order_id !== undefined) {
        Object.assign(body, { identifier: user_order_id });
      }

      const options = this.set_options(body);
      request.delete(
        this.url + "/v1/order?" + encode(body),
        options,
        (error, response, body) => {
          if (error) reject(new Error(error));

          resolve({
            order_id: body.uuid,
            user_order_id: user_order_id,
            symbol: symbol,
            response: body,
          });
        }
      );
    });
  }
}
