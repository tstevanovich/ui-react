import { Server } from "http";
import { createLogger } from "@wf/node-microservice-lib";

import appPromise from "./app";

require("dotenv").config();

const logger = createLogger();

let server: Server;

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    const app = await appPromise();

    server = app.listen(PORT, () => {
      logger.info(`Listening to port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to initialize app:', error);
    process.exit(1);
  }
})();

const exitHandler = (reason?: string) => {
  if (server) {
    server.close(() => {
      logger.info(`Server closed. Reason: ${reason}`);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  exitHandler(error);
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});