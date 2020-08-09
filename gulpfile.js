const axios = require('axios');
const gulp = require('gulp');
const helpers = require('./internals/helpers');
const config = helpers.readFile('./config.json', true);

gulp.task('default', (done) => {
  // Make request for server info
  axios.get(config.api.url)
    .then((response) => {
      const hostName = response.data[0].hostname;

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
      //config.input.file
      helpers.writeFile('./data/core_new.conf', result.replace(/^\"/, '').replace(/\"$/, ''));
      done();
    })
    .catch((error) => {
      console.error(error);
      done();
    });
});
