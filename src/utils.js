import debug from 'debug';

export const createName = (source, ext) => `${source.slice(7).replace(/(\W)/g, '-')}${ext}`;
export const createAssetFileName = (link) => `${link.slice(1).replace(/\//g, '-')}`;
export default debug('page-loader');
