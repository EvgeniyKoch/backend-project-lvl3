import { URL } from 'url';
import cheerio from 'cheerio';

const nodeList = [
  { tag: 'img', attr: 'src' },
  { tag: 'script', attr: 'src' },
  { tag: 'link', attr: 'href' },
];

const filterLinks = (links, source) => links.filter((link) => {
  const { origin } = new URL(link, source);
  return origin === source;
});

const getLinks = (html) => {
  const $ = cheerio.load(html);
  return nodeList.map(({ tag, attr }) => {
    const links = [];

    $(tag).each(function () {
      const link = $(this).attr(attr);
      if (link) {
        links.push(link);
      }
    });

    return links;
  }).flat();
};

export default (html, source) => {
  const links = getLinks(html, source);
  const filteredLinks = filterLinks(links, source);

  return filteredLinks.map((link) => new URL(link, source));
};
