import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

import updateAndGetLayoutLinks from './render-resources.js';
import { createHTMLFile, createResourceDir, createAssetFileName } from './utils.js';

const querySource = (url) => axios.get(url)
  .then((res) => res.data);

export default (source, output) => {
  const file = createHTMLFile(source);
  const pathToFile = path.join(output, file);

  return querySource(source)
    .then((res) => fs.writeFile(pathToFile, res))
    .then(() => fs.readFile(pathToFile, 'utf8'))
    .then((html) => {
      const dir = createResourceDir(source);
      const { urls, layout } = updateAndGetLayoutLinks(html, source, dir);
      const dirFiles = path.join(output, dir);

      fs.mkdir(dirFiles);

      urls.map(({ href, pathname }) => axios({
        method: 'get',
        url: href,
        responseType: 'arraybuffer',
      })
        .then(({ data }) => {
          const filename = createAssetFileName(pathname);
          fs.writeFile(path.join(dirFiles, filename), data, 'binary');
        }));

      return layout;
    })
    .then((html) => fs.writeFile(pathToFile, html))
    .catch((error) => console.log(error, 'error'));
};
