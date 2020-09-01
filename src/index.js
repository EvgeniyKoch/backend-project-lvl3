import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

import getUrlsResource from './source/render-resources.js';

const querySource = (url) => axios.get(url)
  .then((res) => res.data);

const createHTMLFile = (source) => `${source.slice(8).replace(/(\W)/g, '-')}.html`;
const createResourceDir = (source) => `${source.slice(8).replace(/(\W)/g, '-')}_files`;
const createAssetFileName = (link) => `${link.slice(1).replace(/\//g, '-')}`;

export default (source, output) => {
  const file = createHTMLFile(source);
  const pathToFile = path.join(output, file);

  return querySource(source)
    .then((res) => fs.writeFile(pathToFile, res))
    .then(() => fs.readFile(pathToFile, 'utf8'))
    .then((html) => {
      const urls = getUrlsResource(html, source);
      const dir = createResourceDir(source);
      const dirFiles = path.join(output, dir);

      fs.mkdir(dirFiles);

      return urls.map(({ href, pathname }) => axios({
        method: 'get',
        url: href,
        responseType: 'arraybuffer',
      })
        .then(({ data }) => {
          const filename = createAssetFileName(pathname);
          fs.writeFile(path.join(dirFiles, filename), data, 'binary');
        }));
    })
    .catch((error) => console.log(error, 'error'));
};
