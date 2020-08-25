import axios from 'axios';
import fs from 'fs/promises';

const createFile = (file) => `${file.slice(8).replace(/(\W)/g, '-')}.html`;

const querySource = (url) => axios.get(url)
  .then((res) => res.data);

export default (source, output) => {
  const file = createFile(source);
  return querySource(source)
    .then((res) => fs.writeFile(`${output}/${file}`, res));
};
