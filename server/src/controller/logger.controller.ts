import { createLogger } from "@wf/node-microservice-lib";
import { Request, Response } from "express";

const logger = createLogger();

export async function clientLogsHandler(req: Request, res: Response) {
  try {
    const logObj = req.body;

    if (
      logObj === null ||
      logObj === undefined ||
      Object.keys(logObj).length === 0
    ) {
      throw new Error("Missing or empty Request Body");
    }

    let logLevel = 0;
    if (typeof logObj.logLevel === "number") {
      logLevel = logObj.logLevel;
    }
    const rawLogMsg = logObj.logMsg;
    // Prevent log injection by stripping control characters and limiting payload size.
    const logMsg =
      typeof rawLogMsg === "string"
        ? rawLogMsg
            .replace(/[\r\n]/g, " ")
            .replace(/[\x00-\x1f\x7f]/g, "")
            .substring(0, 4096)
        : "";

    if (rawLogMsg === null || rawLogMsg === undefined) {
      throw new Error("Missing log message in Request");
    }

    switch (logLevel) {
      case 0:
      case 1:
        logger.debug(logMsg);
        break;
      case 2:
        logger.info(logMsg);
        break;
      case 3:
        logger.warn(logMsg);
        break;
      case 4:
        logger.error(logMsg);
        break;
      case 5:
        logger.error(logMsg);
        break;
      default:
        logger.debug(logMsg);
        break;
    }
    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({ errorMessage: error.message });
  }
}