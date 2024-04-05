import { config } from "dotenv";
import CoinoneWebSocketClient from "./exchanges/coinone/coinone-websocket-client";
import UpbitWebSocketClient from "./exchanges/upbit/upbit-websocket-client";
import Exchange from "./exchanges/aggregate/exchange";
import { Symbol } from "./exchanges/aggregate/dto/symbol";
import CoinoneRestApiClient from "./exchanges/coinone/coinone-rest-api-client";
import { isSupportSymbol } from "./exchanges/utils";
import { container } from "./exchanges/aggregate/container";
import { logger } from "./logger";

config();

const reset = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const trade_symbol: string | undefined = process.env.TRADE_SYMBOL;
    logger.info(trade_symbol);
    if (trade_symbol !== undefined) {
      const trade_symbols: string[] = trade_symbol.split(",");

      const coinone_rest_api_client = new CoinoneRestApiClient();

      trade_symbols.forEach(async (symbol: string) => {
        if (isSupportSymbol(symbol)) {
          const enum_symbol: Symbol = Symbol[symbol as keyof typeof Symbol];
          const result: number = await coinone_rest_api_client.delete_all_order(
            enum_symbol
          );
          logger.info(`Delete order count: ${result}`);
        } else {
          throw new Error("not support SYMBOL");
        }
      });
      resolve();
    } else {
      reject("required TRADE_SYMBOL");
    }
  });
};

const arbitrage = async (): Promise<void> => {
  await reset();
  const exchange = new Exchange();
  const insterval = setInterval(() => {
    logger.info(exchange.state);
    if (exchange.state === "READY") {
      container.coinone = new CoinoneWebSocketClient(exchange);
      container.upbit = new UpbitWebSocketClient(exchange);
      clearInterval(insterval);
    }
  }, 500);
};
arbitrage();

const finishing = async (): Promise<void> => {
  const interval = setInterval(() => {
    if (container.coinone !== undefined) {
      if (container.coinone.ws === undefined) {
        container.coinone = undefined;
        logger.info("Distructor Coinone");
      } else {
        clearTimeout(container.coinone.timeout);
        container.coinone.timeout = undefined;
        container.coinone.ws.removeAllListeners();
        container.coinone.ws.pause();
        container.coinone.ws.close(4000);
        delete container.coinone.ws;
        container.coinone.ws = undefined;
      }
    }

    if (container.upbit !== undefined) {
      if (container.upbit.ws === undefined) {
        container.upbit = undefined;
        logger.info("Distructor Upbit");
      } else {
        clearTimeout(container.upbit.timeout);
        container.upbit.timeout = undefined;
        container.upbit.ws.removeAllListeners();
        container.upbit.ws.pause();
        container.upbit.ws.close(4000);
        delete container.upbit.ws;
        container.upbit.ws = undefined;
      }
    }

    if (container.coinone === undefined && container.upbit === undefined) {
      clearInterval(interval);
    }
  }, 1000);

  reset();
};

process.on("SIGINT", finishing);
process.on("SIGQUIT", finishing);
process.on("SIGTERM", finishing);
