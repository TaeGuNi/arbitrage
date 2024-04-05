import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import AbstractWebSocketClinet from "../abstract-websocket-client";
import { Symbol } from "../aggregate/dto/symbol";
import Exchange from "../aggregate/exchange";
import Orderbook from "./dto/orderbook";
import { symbol_to_string } from "../utils";
import { logger } from "../../logger";

export default class UpbitWebSocketClient extends AbstractWebSocketClinet {
  private static readonly ADDRESS: string = "wss://api.upbit.com/websocket/v1";

  constructor(ex: Exchange) {
    super(UpbitWebSocketClient.ADDRESS, ex);
  }

  on(): void {
    if (this.ws !== undefined) {
      this.ws.on("open", () => {
        logger.info("connected Upbit");
      });

      this.ws.on("message", (message: string) => {
        const json = JSON.parse(message);
        if (json.hasOwnProperty("status")) {
          if (json.status === "UP") {
            logger.debug("PONG Upbit v1.1.6");
          }
        } else if (json.hasOwnProperty("type") && json.type === "orderbook") {
          this.orderbook(json);
        } else {
          logger.debug(message.toString());
        }
      });

      this.ws.on("error", (error: Error) => {
        logger.error(error.name);
        logger.error(error.message);
        logger.error(error.stack);
      });

      this.ws.on("close", (code: number, reason: Buffer) => {
        logger.warn("Disconnected Websocket from Upbit");
        logger.warn("code: " + code);
        logger.warn("reason: " + reason.toString());
        if (this.ws !== undefined) {
          this.ws.removeAllListeners();
        }
        delete this.ws;
        this.ws = undefined;
        if (code === 1000) {
          this.connect(UpbitWebSocketClient.ADDRESS);
        }
      });

      this.ws.on("ping", (data?: Buffer) => {
        logger.debug("PING Upbit");
        logger.debug(data);
        if (this.ws !== undefined && this.ws.readyState === WebSocket.OPEN) {
          this.ws.pong();
        }
      });

      this.ws.on("pong", (data?: Buffer) => {
        logger.debug("PONG Upbit");
        logger.debug(data);
      });
    } else {
      throw new Error("Undefined Websocket to Upbit");
    }
  }

  init(): void {
    const symbols: string[] = [];
    this.trade_symbols.map((symbol: Symbol) => {
      symbols.push(symbol_to_string(symbol).toUpperCase());
    });
    logger.debug(symbols);
    const interval = setInterval(() => {
      if (
        this.ws !== undefined &&
        this.ws.readyState === WebSocket.OPEN &&
        symbols.length > 0
      ) {
        this.subscribe_orderbook(symbols);
        clearInterval(interval);
      }
    }, 1000);
  }

  heartbeat(): void {
    if (
      this.ws !== undefined &&
      this.ws.readyState === WebSocket.OPEN &&
      this.timeout !== undefined
    ) {
      // this.ws.send("PING");
      this.ws.ping();
      this.timeout.refresh();
    }
  }

  subscribe_orderbook(symbols: string[]): void {
    const codes: string[] = [];
    symbols.forEach((symbol: string) => {
      codes.push("KRW-" + symbol + ".1");
    });

    const interval = setInterval(() => {
      if (this.ws !== undefined && this.ws.readyState === 1) {
        const request = [
          {
            ticket: uuidv4(),
          },
          {
            type: "orderbook",
            codes: codes,
          },
          {
            format: "DEFAULT",
          },
        ];
        const request_raw = JSON.stringify(request);
        this.ws.send(request_raw);
        clearInterval(interval);
      }
    }, 1000);
  }

  orderbook(ob: Orderbook): void {
    const ask_price: number = ob.orderbook_units[0].ask_price;
    const ask_qty: number = ob.orderbook_units[0].ask_size;
    this.ex.update({
      date: ob.timestamp,
      exchange: "UPBIT",
      type: "ASK",
      quote_currency: "KRW",
      target_currency:
        Symbol[ob.code.replace("KRW-", "") as keyof typeof Symbol],
      price: ask_price,
      qty: ask_qty,
    });

    const bid_price: number = ob.orderbook_units[0].bid_price;
    const bid_qty: number = ob.orderbook_units[0].bid_size;
    this.ex.update({
      date: ob.timestamp,
      exchange: "UPBIT",
      type: "BID",
      quote_currency: "KRW",
      target_currency:
        Symbol[ob.code.replace("KRW-", "") as keyof typeof Symbol],
      price: bid_price,
      qty: bid_qty,
    });
  }
}
