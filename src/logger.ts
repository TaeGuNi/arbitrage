import { config } from "dotenv";
import { createLogger, transports, format } from "winston";

config();

interface TransformableInfo {
  level: string;
  message: string;
  [key: string]: any;
}

export const logger = createLogger({
  transports: [
    new transports.Console({
      level:
        process.env.LOG_LEVEL === undefined ? "debug" : process.env.LOG_LEVEL,
      format: format.combine(
        format.timestamp({
          format: "YY-MM-DD HH:mm:ss",
        }),
        format.colorize(),
        format.printf(
          (info: TransformableInfo) =>
            `${info.timestamp} - ${info.level}: ${info.message}`
        )
      ),
    }),
  ],
});

export const reset = "\x1b[0m";
export const red = "\x1b[31m";
export const green = "\x1b[32m";
export const yellow = "\x1b[33m";
