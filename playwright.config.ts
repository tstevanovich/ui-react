import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';


//Switch test environments
const environment = "Default";
dotenv.config({ path: path.resolve("resources/environments", `${environment}.env`) });

//Generate test results file dynamically to preserve the execution history
// const testResultsDir = 'test-results';
// const currentDateTime = new Date().toISOString().replace(/[:.]/g, "_").slice(0, -1);
// const outputFolder = `./${testResultsDir}/results-${currentDateTime}`;

//hyper execute settings
function getCapabilities(browserName, testName = "PW-TEST") {
  return {
    browserName,
    "LT:Options": {
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      name: testName,
      visual: true
    },
  };
}

const isLinux = process.platform === 'linux';

//Config Options
module.exports = defineConfig({

  //Folder for tests
  testDir: './tests/tests',

  //Folder for attachments
  // outputDir: `./${testResultsDir}/attachments`,

  //Default timeout in case of auto-wait functions
  timeout: 100 * 1000,

  //Default timeout in case of auto-wait assertions
  expect: {
    timeout: 20 * 1000,
  },

  // //Run tests in files parallel
  // fullyParallel: true,

  //Opt out of parallel execution
  //workers: 1,

  //Fail the build on CI if you accidentally left test.only in the source code
  //forbidOnly: !!process.env.CI,

  //Retry on CI only
  //retries: process.env.CI ? 2 : 0,

  //Opt out of parallel execution on CI
  //workers: process.env.CI ? 1 : undefined,

  //Reporter(s) to use. See https://playwright.dev/docs/test-reporters
  reporter: [
    ["html", {open: "never" } ],
    ["junit", { outputFile: "playwright-report/results.xml" }],
  ],

  //Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions
  use: {

    //Base URL
    baseURL: process.env.BASE_URL,

    //Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: 'on',

    //Collect screenshots
    screenshot: 'on',

    actionTimeout: 120000, // 120 seconds for each action

    navigationTimeout: 120000, // 120 seconds for navigation

    ignoreHTTPSErrors: true,

    viewport: { width: 1920, height: 1080 },

  },

  //Configure projects for major browsers. See https://playwright.dev/docs/browsers
  projects: [
      /* {
        // config for HyperExecute platform (Linux) or Local Windows
        name: isLinux ? undefined : 'Google Chrome',
        use: isLinux
          ? {
              connectOptions: {
                wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
                  JSON.stringify(getCapabilities("chrome"))
                )}`,
              },
              trace: 'on',
              viewport: { width: 1280, height: 720 },
            }
          : {
              ...devices['Desktop Chrome'],
              viewport: { width: 1920, height: 1080 },
              channel: 'chrome',
              headless: false,
              screenshot: 'on',
              trace: 'on',
            },
      }, */

      {
  // config for HyperExecute platform (Linux) or Local Windows
  name: isLinux ? undefined : 'Microsoft Edge',
  use: isLinux
    ? {
        connectOptions: {
          wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
            JSON.stringify(getCapabilities("MicrosoftEdge"))
          )}`,
        },
        trace: 'on',
        viewport: { width: 1280, height: 720 },
      }
    : {
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1080 },
        channel: 'msedge',
        headless: false,
        screenshot: 'on',
        trace: 'on',
      },
},

    //{
    // config for HyperExecute platform (Linux) or Local Windows
    // name: isLinux ? undefined : 'Microsoft Edge',
    // use: isLinux
    //   ? {
    //       connectOptions: {
    //         wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
    //           JSON.stringify(getCapabilities("MicrosoftEdge"))
    //         )}`,
    //       },
    //       trace: 'on',
    //       viewport: { width: 1280, height: 720 },
    //     }
    //   : {
    //       ...devices['Desktop Edge'],
    //       viewport: { width: 1920, height: 1080 },
    //       channel: 'msedge',
    //       headless: false,
    //       screenshot: 'on',
    //       trace: 'on',
    //     },
    // },

  ],

});