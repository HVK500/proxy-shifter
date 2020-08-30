const fs = require('fs');
const pathing = require('path');
const mkdirp = require('mkdirp');

const createPath = (path) => {
  const directory = pathing.dirname(path);
  fs.mkdirSync(directory, {recursive: true});
  return path;
};

module.exports = {
  formatTimeStamp:() => {
    const timeStamp = new Date();
    return `${timeStamp.getFullYear()}-${timeStamp.getMonth()+1}-${timeStamp.getDate()}-${timeStamp.getHours()}-${timeStamp.getMinutes()}`;
  },
  readFile: (path, parse) => {
    path = pathing.resolve(path);
    const result = fs.readFileSync(path, { encoding: 'utf8' });
    return !parse ? result : JSON.parse(result);
  },
  writeFile: (path, data, parse) => {
    data = !parse ? data : JSON.stringify(data, null, 2);
    fs.writeFileSync(createPath(path), data);
  },
  getFileName: (path) => {
    return pathing.basename(path, pathing.extname(path));
  }
}
