import express from "express";
import { clientLogsHandler } from "../controller/logger.controller";

const router = express.Router();

/**
 * @openapi
 * /healthcheck:
 *  get:
 *    tags:
 *    - Healthcheck
 *    description: Healthcheck endpoint
 *    responses:
 *      200:
 *        description: App is up and running
 */
router.get('/healthcheck', (req, res) => res.sendStatus(200));

/**
 * @openapi
 * '/api/clientlogs':
 *  post:
 *    tags:
 *    - Protected
 *    summary: Api to recieve logs from UI to server
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            additionalProperties: true
 *    responses:
 *      200:
 *        description: Returns success message
 *      500:
 *        description: Returns error message
 */
router.post("/clientlogs", clientLogsHandler);

export default router;