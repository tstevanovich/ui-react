export const test = base.extend<{ forEachTest: void }>({
  forEachTest: [
    async ({ page }, use, testInfo) => {
      await use();
      console.log('***Test is complete');
      // This code runs after every test.
      if (process.platform === 'linux') {
        // Determine status based on test result
        const status = testInfo.status === 'passed' ? 'Passed' : 'Failed';
        const script = `lambdatest_action: {"action": "setTestStatus", "arguments": {"status":"${status}", "remark": "test completed"}}`;
        // Execute the script in the browser context
        await page.evaluate((command) => {
          console.debug(command);
        }, script);
      }
    },
    { auto: true }
  ] // automatically starts for every test.
});
// Retained for future remote test integration; local tests use @playwright/test directly.
import { test as base } from '@playwright/test';
