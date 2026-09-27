import type { Express } from 'express';
import express from 'express';

jest.mock('elastic-apm-node', () => {
  return {
    start: jest.fn(),
    captureError: jest.fn()
  };
});

const mockCreateApp = jest.fn();

jest.mock('@wf/node-microservice-lib', () => {
  const actual = jest.requireActual('@wf/node-microservice-lib');
  return {
    ...actual,
    createApp: (...args: unknown[]) => mockCreateApp(...args)
  };
});

// Import AFTER mocks are defined
import appPromise from './app';

describe('app', () => {
  let app: Express;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock createApp to return a simple Express app
    mockCreateApp.mockImplementation(async () => {
      const mockApp = express();
      mockApp.get('/healthcheck', (req, res) => res.status(200).send('OK'));
      return mockApp;
    });

    app = await appPromise();
  });

  it('should create app without errors', async () => {
    expect(app).toBeDefined();
    expect(mockCreateApp).toHaveBeenCalled();
  });
});
