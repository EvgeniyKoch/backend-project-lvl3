import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import debug from 'debug';
import axiosDebugger from 'axios-debug-log';

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
      fs.writeFile(pathToFile, layout);
    })
    .then(() => fs.mkdir(dirFiles))
    .then(() => urlsList.map(({ href, pathname }) => axios({
      method: 'get',
      url: href,
      responseType: 'arraybuffer',
    })
      .then(({ data }) => {
        const filename = createAssetFileName(pathname);
        fs.writeFile(path.join(dirFiles, filename), data);
        log('%o', `file: ${filename} wrote to ${dirFiles}`);
      })
      .catch((error) => {
        log('%o', `Failed to write file. error: ${error.message}`);
        console.log(error);
      })))
    .catch((error) => {
      log('%o', `Failed to write layout. ${error.message}`);
      throw new Error(error.message);
    });
};
