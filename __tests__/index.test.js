import fs from 'fs/promises';
import os from 'os';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import nock from 'nock';
import pageLoader from '../src/index.js';

nock.disableNetConnect();

const __filename = fileURLToPath(import.meta.url); // eslint-disable-line no-underscore-dangle
const __dirname = dirname(__filename); // eslint-disable-line no-underscore-dangle
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

let html;
let tempDir;
beforeAll(async () => {
  html = await fs.readFile(getFixturePath('courses.html'), 'utf-8');
});

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterEach(async () => {
  fs.rmdir(tempDir, { recursive: true });
});

test('load page with assets', async () => {
  nock('https://example.ru')
    .get('/page')
    .reply(200, html);

  const url = 'https://example.ru/page';
  await pageLoader(url, tempDir);
  const actualHTML = await fs.readFile(path.join(tempDir, 'example-ru-page.html'), 'utf-8');
  expect(actualHTML).toBe(html);
});
