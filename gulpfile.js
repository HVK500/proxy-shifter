const axios = require('axios');
const gulp = require('gulp');
const helpers = require('./internals/helpers');
const config = helpers.readFile('./config.json', true);

const HTTPS_PROXY_ID = 21;
const STATE = 'online';

gulp.task('default', (done) => {
  // Make request for server info
  axios.get(config.api.url)
    .then((response) => {
      let hostName = null;
      for (const data of response.data) {
        if (data.status.toLowerCase() === STATE &&
          data.technologies.filter(x => x.id === HTTPS_PROXY_ID).length === 1) {
            hostName = data.hostname;
            console.log(`Selected "${hostName}" with current load of ${data.load}`);
            break;
        }
      }

      // Read input file
      const fileContent = JSON.stringify(helpers.readFile(config.input.file)).replace(/\s/g,''); // Remove all whitespace

      // Remove start of file
      const fileObject = JSON.parse(JSON.parse(fileContent.replace('"{\\n\\"file\\":1,\\n\\"format\\":1\\n}{', '"{')));

      // Replace proxy entrie
      let previousHost = fileObject.proxy.hostname;
      fileObject.proxy.hostname = hostName;

      // Add back start of file
      let result = JSON.stringify({file: 1, format: 1}, null, 2) + JSON.stringify(fileObject, null, 2);

      // Correct inconsistancies on the .conf
      config.inconsistencyCorrection.forEach((replace) => {
        result = result.replace(replace.from, replace.to);
      });

      console.log(`Changed proxy from: "${previousHost}" = to => "${hostName}"`);

      // Save file to disk
      helpers.writeFile(config.input.file, result.replace(/^\"/, '').replace(/\"$/, ''));
      done();
    })
    .catch((error) => {
      console.error(error);
      done();
    });
});
