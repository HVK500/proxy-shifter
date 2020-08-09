const axios = require('axios');
const gulp = require('gulp');
const helpers = require('./internals/helpers');
const config = helpers.readFile('./config.json', true);

gulp.task('default', () => {
  // Make request for server info
  axios.get(config.api.url)
    .then((response) => {
      const hostName = response.data[0].hostname;

      // Read input file
      const fileContent = JSON.stringify(helpers.readFile(config.input.file)).replace(/\s/g,''); // Remove all whitespace

      // Remove start of file
      const fileObject = JSON.parse(JSON.parse(fileContent.replace('"{\\n\\"file\\":1,\\n\\"format\\":1\\n}{', '"{')));

      let oldHostName = '';
      // Replace all proxy entries
      config.targetProxyEntries.forEach((proxyOption) => {
        oldHostName = fileObject.proxies[proxyOption].hostname;
        fileObject.proxies[proxyOption].hostname = hostName;
      });

      // Add back start of file
      let result = JSON.stringify({file: 1, format: 1}, null, 2) + JSON.stringify(fileObject, null, 2);

      // Correct inconsistancies on the .conf
      config.inconsistencyCorrection.forEach((replace) => {
        result = result.replace(replace.from, replace.to);
      });

      console.log(`Changed proxy from: "${oldHostName}" = to => "${hostName}"`);

      // Save file to disk
      helpers.writeFile(config.input.file, result.replace(/^\"/, '').replace(/\"$/, ''));
    })
    .catch((error) => {
      console.error(error);
    });
});
