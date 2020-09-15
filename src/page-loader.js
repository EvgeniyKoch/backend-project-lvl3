import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import axiosDebugger from 'axios-debug-log';
import Listr from 'listr';

import updateLayoutAndGetLinks from './render-resources.js';
import log, { createName, createAssetFileName } from './utils.js';

axiosDebugger(log);

const querySource = (url) => axios.get(url)
  .then((res) => res.data);

export default (source, output) => {
  log('%o', `Starting download page ${source} to ${output}`);

  const fileName = createName(source, '.html');
  const pathToFile = path.join(output, fileName);
  const dirName = createName(source, '_files');
  const dirFiles = path.join(output, dirName);
  let urlsList;

  return querySource(source)
    .then((html) => {
      const { urls, layout } = updateLayoutAndGetLinks(html, source, dirName);
      urlsList = urls;
      fs.writeFile(pathToFile, layout);
    })
    .then(() => fs.mkdir(dirFiles))
    .then(() => urlsList.forEach(({ href, pathname }) => {
      new Listr([{
        title: `Download file ${href}`,
        task: () => axios({
          method: 'get',
          url: href,
          responseType: 'arraybuffer',
        })
          .then(({ data }) => {
            const filename = createAssetFileName(pathname);
            fs.writeFile(path.join(dirFiles, filename), data);
          }),
      }], { concurrent: true, exitOnError: false }).run();
    }))
    .catch((error) => {
      log('%o', `Failed to write layout. ${error.message}`);
      throw new Error(error.message);
    });
};
