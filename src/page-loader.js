import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import debug from 'debug';
import axiosDebugger from 'axios-debug-log';
import Listr from 'listr';

import updateLayoutAndGetLinks from './render-resources.js';
import { createName, createAssetFileName } from './utils.js';

const log = debug('page-loader');

axiosDebugger(log);

const querySource = (url) => axios.get(url)
  .then((res) => res.data);

export default (source, output) => {
  log('%o', 'Starting cli');

  const fileName = createName(source, '.html');
  const pathToFile = path.join(output, fileName);
  const dirName = createName(source, '_files');
  const dirFiles = path.join(output, dirName);
  let urlsList;

  return querySource(source)
    .then((html) => {
      log('%o', 'updating layout');
      const { urls, layout } = updateLayoutAndGetLinks(html, source, dirName);
      urlsList = urls;
      new Listr([{
        title: 'Download updated layout',
        task: () => fs.writeFile(pathToFile, layout),
      }], { concurrent: true, exitOnError: false }).run();
    })
    .then(() => {
      new Listr([{
        title: 'Create directory',
        task: () => fs.mkdir(dirFiles),
      }], { concurrent: true, exitOnError: false }).run();
    })
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
