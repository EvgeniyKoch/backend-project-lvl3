export const createHTMLFile = (source) => `${source.slice(8).replace(/(\W)/g, '-')}.html`;
export const createResourceDir = (source) => `${source.slice(8).replace(/(\W)/g, '-')}_files`;
export const createAssetFileName = (link) => `${link.slice(1).replace(/\//g, '-')}`;
