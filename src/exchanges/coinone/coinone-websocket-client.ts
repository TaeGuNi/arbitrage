import { WebSocket } from "ws";
import AbstractWebSocketClinet from "../abstract-websocket-client";
import Exchange from "../aggregate/exchange";
import { Symbol } from "../aggregate/dto/symbol";
import Orderbook from "./dto/orderbook";
import { symbol_to_string } from "../utils";
import { logger } from "../../logger";

export default class CoinoneWebSocketClient extends AbstractWebSocketClinet {
  private static readonly ADDRESS: string = "wss://stream.coinone.co.kr";

  constructor(ex: Exchange) {
    super(CoinoneWebSocketClient.ADDRESS, ex);
  }

  on(): void {
    if (this.ws !== undefined) {
      this.ws.on("open", () => {
        logger.info("connected Coinone");
      });

      this.ws.on("message", (message: string) => {
        const json = JSON.parse(message);
        if (json.response_type === "PONG") {
          logger.debug("PONG Coinone");
        } else if (json.response_type === "DATA") {
          if (json.channel === "ORDERBOOK") {
            this.orderbook(json);
          }
        } else {
          logger.debug(message.toString());
        }
      });

      this.ws.on("error", (error: Error) => {
        logger.error(error.message);
      });

      this.ws.on("close", (code: number, reason: Buffer) => {
        logger.warn("Disconnected Websocket from Coinone");
        logger.warn("code: " + code);
        logger.warn("reason: " + reason.toString());
        if (this.ws !== undefined) {
          this.ws.removeAllListeners();
        }
        delete this.ws;
        this.ws = undefined;
        if (code === 1000) {
          this.connect(CoinoneWebSocketClient.ADDRESS);
        }
      });
    } else {
      throw new Error("Undefined Websocket to Coinone");
    }
  }

  init(): void {
    const interval = setInterval(() => {
      if (this.ws !== undefined && this.ws.readyState === WebSocket.OPEN) {
        this.trade_symbols.map((symbol: Symbol) => {
          this.subscribe_orderbook(symbol_to_string(symbol).toUpperCase());
        });
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
      const ping = {
        request_type: "PING",
      };
      const ping_raw = JSON.stringify(ping);
      this.ws.send(ping_raw);
      this.timeout.refresh();
    }
  }

  subscribe_orderbook(symbol: string): void {
    const interval = setInterval(() => {
      if (this.ws !== undefined && this.ws.readyState === WebSocket.OPEN) {
        const request = {
          request_type: "SUBSCRIBE",
          channel: "ORDERBOOK",
          topic: {
            quote_currency: "KRW",
            target_currency: symbol,
          },
        };
        const request_raw = JSON.stringify(request);
        this.ws.send(request_raw);
        clearInterval(interval);
      }
    }, 1000);
  }

  orderbook(ob: Orderbook): void {
    const len: number = ob.data.asks.length;
    const ask1 = ob.data.asks[len - 1];
    // const ask2 = ob.data.asks[len - 2];
    this.ex.update({
      date: ob.data.timestamp,
      exchange: "COINONE",
      type: "ASK",
      quote_currency: "KRW",
      target_currency: ob.data.target_currency,
      price: ask1.price,
      qty: ask1.qty,
    });

    const bid1 = ob.data.bids[0];
    // const bid2 = ob.data.bids[1];
    this.ex.update({
      date: ob.data.timestamp,
      exchange: "COINONE",
      type: "BID",
      quote_currency: "KRW",
      target_currency: ob.data.target_currency,
      price: bid1.price,
      qty: bid1.qty,
    });
  }
}
