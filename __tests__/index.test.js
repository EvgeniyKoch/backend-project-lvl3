import fs from 'fs/promises';
import os from 'os';
import path, { dirname } from 'path';
import nock from 'nock';
import { fileURLToPath } from 'url';
import debug from 'debug';

import { beforeAll } from '@jest/globals';
import pageLoader from '../src/page-loader.js';

nock.disableNetConnect();
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const url = 'http://example.ru';

let html;
let tempDir;
let css;

beforeAll(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

beforeEach(async () => {
  html = await fs.readFile(getFixturePath('index.html'), 'utf-8');
  css = await fs.readFile(getFixturePath('style.css'), 'utf-8');
  debug.enable('page-loader');
});

afterAll(async () => {
  await fs.rmdir(tempDir, { recursive: true });
});

describe('Tests', () => {
  it('should load page', async () => {
    nock(url)
      .get('/')
      .reply(200, html);

    nock(url)
      .get('/style.css')
      .reply(200, css);

    nock(url)
      .get('/terminal.jpg')
      .replyWithFile(200, getFixturePath('terminal.jpg'));

    nock(url)
      .get('/main.js')
      .replyWithFile(200, getFixturePath('main.js'));

    await pageLoader(`${url}`, tempDir);

    const receivedHTML = await fs.readFile(path.join(tempDir, 'example-ru.html'), 'utf-8');
    const sources = await fs.readdir(tempDir);

    expect(receivedHTML).toBeTruthy();
    expect(sources).toHaveLength(2);
  });

  it('should load assets', async () => {
    const expectedCss = await fs.readFile(path.join(tempDir, 'example-ru_files/style.css'), 'utf-8');
    const expectedImg = await fs.readFile(path.join(tempDir, 'example-ru_files/terminal.jpg'), 'utf-8');

    expect(expectedCss).toMatch(css);
    expect(expectedImg).toBeTruthy();
  });

  it('should return toThrow', async () => {
    nock(url)
      .get('/empty')
      .replyWithError({
        message: 'Error: Request failed with status code 404',
        code: 'NOT_FOUND',
      });

    await expect(pageLoader(`${url}/empty`, tempDir)).rejects.toThrow('404');
  });
});
