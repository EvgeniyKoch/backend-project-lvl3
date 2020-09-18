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
  let linksAndLayout;

  return querySource(source)
    .then((html) => {
      linksAndLayout = updateLayoutAndGetLinks(html, source, dirName);
    })
    .then(() => fs.mkdir(dirFiles))
    .then(() => {
      const { urls } = linksAndLayout;
      const tasks = urls.map(({ href, pathname }) => {
        log('%o', `Download resource ${href}`);
        return {
          title: `Download file ${path.extname(pathname.slice(0, 1))}`,
          task: () => axios({
            method: 'GET',
            url: href,
            responseType: 'arraybuffer',
          })
            .then(({ data }) => {
              const filename = createAssetFileName(pathname);
              log('%o', `Saving file ${filename}`);
              return fs.writeFile(path.join(dirFiles, filename), data);
            }),
        };
      });
      return new Listr(tasks, { concurrent: true, exitOnError: false })
        .run()
        .catch((error) => ({ message: 'Resource download failed.', error }));
    })
    .then(() => fs.writeFile(pathToFile, linksAndLayout.layout))
    .catch((error) => {
      log('%o', `Failed to write layout. ${error.message}`);
      throw new Error(error.message);
    });
};
