import request from "supertest";
import express, { Express } from "express";
import { clientLogsHandler } from "./logger.controller";

describe("logger.controller", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/clientlogs", clientLogsHandler);
  });

  test.each([
    [null, "Test log level invalid"],
    [0, "Test log level 0"],
    [1, "Test log level 1"],
    [2, "Test log level 2"],
    [3, "Test log level 3"],
    [4, "Test log level 4"],
    [5, "Test log level 1"],
    [10, "Test log level 10"],
  ])(
    "should respond with success for valid log level %i",
    async (logLevel, logMsg) => {
      const log = { logLevel, logMsg };
      const response = await request(app).post("/clientlogs").send(log);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    },
  );

  test("should respond with error message when invalid request body", async () => {
    const response = await request(app).post("/clientlogs").send(null);
    expect(response.status).toBe(500);
    console.log(response.body);
    expect(response.body.errorMessage).toEqual("Missing or empty Request Body");
  });

  test("should respond with error message when request body missing logMsg", async () => {
    const log = { logLevel: 1 };
    const response = await request(app).post("/clientlogs").send(log);
    expect(response.status).toBe(500);
    console.log(response.body);
    expect(response.body.errorMessage).toEqual(
      "Missing log message in Request",
    );
  });