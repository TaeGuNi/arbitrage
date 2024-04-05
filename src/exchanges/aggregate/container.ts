import CoinoneWebSocketClient from "../coinone/coinone-websocket-client";
import UpbitWebSocketClient from "../upbit/upbit-websocket-client";

export interface Container {
  coinone?: CoinoneWebSocketClient | undefined;
  upbit?: UpbitWebSocketClient | undefined;
}

export const container: Container = {};
