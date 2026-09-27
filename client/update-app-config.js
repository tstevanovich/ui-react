const fs = require('fs');

const usingEPLX = !!process.env['RELEASE_NUMBER'];

const branchName = process.env['BRANCH_NAME'] || process.env['BUILD_ID'] || 'LOCAL';
const releaseNumber = process.env['RELEASE_NUMBER'] || process.env['BUILD_DISPLAY_NAME'] || '0.0';

// If using EPLX, remove the rc number from the release number
const r = usingEPLX ? releaseNumber.replace(/-rc\d+/, '') : releaseNumber;

const appConfig = {
  buildId: branchName,
  buildName: r
};

fs.writeFile('./src/app/config/appConfiguration.json', JSON.stringify(appConfig), () => {
  console.log(appConfig.buildId);
  console.log(appConfig.buildName);
});
