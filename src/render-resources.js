import { URL } from 'url';
import path from 'path';
import cheerio from 'cheerio';
import { createAssetFileName } from './utils.js';

const nodeList = [
  { tag: 'img', attr: 'src' },
  { tag: 'script', attr: 'src' },
  { tag: 'link', attr: 'href' },
];

const hasLocalLink = (link, source) => {
  const url = new URL(link, source);
  const { origin } = new URL(source);
  return url.origin === origin;
};

export default (html, source, dir) => {
  const $ = cheerio.load(html);
  const urls = [];

  nodeList.forEach(({ tag, attr }) => $(tag).each((i, el) => {
    const element = $(el);
    const link = element.attr(attr);
    const isLocalLink = hasLocalLink(link, source);

    if (link && isLocalLink) {
      const url = new URL(link, source);
      const filename = createAssetFileName(url.pathname);
      const pathToFile = path.join(dir, filename);
      urls.push(url);
      element.attr(attr, pathToFile);
    }
  }));

  return {
    urls,
    layout: $.html({ decodeEntities: false }),
  };
};
