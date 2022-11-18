/** @module Scraper */

const fs = require('fs');
const path = require('path');
const Axios = require('axios');
const puppeteer = require('puppeteer');
const { SELECTORS } = require('./constants');
const { log, error } = require('./chalk');

/**
 * @typedef ChapterConfiguration
 * @type {Object}
 * @property {string} link
 * @property {string} title
*/

/**
  * @typedef ScrapConfiguration
  * @type {Object}
  * @property {string} mangaName
  * @property {Array<ChapterConfiguration>} chapterElements
  * @property {string} UrlOrigin
  * @property {string} savePath
*/

/**
  * @typedef CommandArguments
  * @type {Object}
  * @property {string} mangaTitlePage
  * @property {string} savePath
*/

/**
  * @type {puppeteer.Browser}
*/
let browser;

/**
  * @type {puppeteer.Page}
*/
let page;

/**
  * rmanga-scrapper scrap entry action
  * @param {CommandArguments} options
  * @return {Promise<void>}
*/
module.exports = async function scrap(options) {
  try {
    await setupPuppeteer();
    await visitPage(options.mangaTitlePage);

    const mangaName = await getMangaName();

    await setupMangaFolder(path.join(options.savePath, mangaName));
    await openFirstChapter();
    await waitUntilMangaBoxLoaded();
    await confirmEightyYears();
    await waitUntilMangaBoxLoaded();
    await loopChapterScrap(await getLoopChaptersScrapConfig(mangaName, options));
    await terminatePuppeteer();
  } catch (err) {
    log(error(err));
  }
};

/**
  * create puppeteer browser and page
  * @return {Promise<void>}
*/
async function setupPuppeteer() {
  browser = await puppeteer.launch({ headless: true, args: [] });
  page = await browser.newPage();
}

/**
  * create directory for scrapped manga
  * @return {Promise<void>}
*/
async function setupMangaFolder(mangaName) {
  if (!fs.existsSync(mangaName)) fs.mkdirSync(mangaName);
}

/**
  * @param {ScrapConfiguration} scrapConfiguration
  * @return {Promise<void>}
*/
async function loopChapterScrap(scrapConfiguration) {
  const {
    savePath, mangaName, chapterElements, UrlOrigin,
  } = scrapConfiguration;

  for (let index = 0; index < chapterElements.length; index++) {
    const chapterFolderPath = path.resolve(savePath, mangaName, chapterElements[index].title);
    const isExistedChapter = fs.existsSync(chapterFolderPath);

    if (!isExistedChapter) fs.mkdirSync(chapterFolderPath);

    await visitPage(`${UrlOrigin}/${chapterElements[index].link}`);
    await confirmEightyYears();
    await readPageSettingsPreparation();

    const links = await getPageLinks();

    await Promise.all(
      links.map((link, linkIndex) => downloadImage(link, chapterFolderPath, `${linkIndex + 1}.jpeg`)),
    );
  }
}

/**
 * Check and setup one page read mode and refresh for confirmation
 * @return {Promise<void>}
 */
async function readPageSettingsPreparation() {
  await page.waitForSelector(SELECTORS.READER_SETTINGS_BUTTON, { visible: true });

  if (!await isActiveOnePageModeButton()) await prepareStandardPageMode();

  await waitUntilMangaBoxLoaded();
  await closeSettingsPopup();
}

/**
 * Settings popup close function
 * @returns {Promise<void>}
 */
async function closeSettingsPopup() {
  await page.$eval(SELECTORS.READER_SETTINGS_MODAL_CLOSE_BUTTON, (element) => {
    if (element) element.click();
  });
  await page.waitForSelector(SELECTORS.READER_SETTINGS_MODAL_CLOSE_BUTTON, { visible: false });
}

/**
  * first chapter button click in title manga page
  * @return {Promise<void>}
*/
async function openFirstChapter() {
  await page.click(SELECTORS.READ_FIRST_CHAPTER);
}

/**
  * Standard one page view mode preparation
  * @returns {Promise<void>}
*/
async function prepareStandardPageMode() {
  await page.$eval(
    SELECTORS.READER_SETTINGS_BUTTON,
    (element) => (element ? element.click() : null),
  );
  await page.waitForSelector(SELECTORS.READER_SETTINGS_MODAL, { visible: true });
  await page.waitForSelector(SELECTORS.READER_SETTINGS_BUTTON_GROUP, { visible: true });
  await page.waitForSelector(SELECTORS.READER_READING_STANDARD_MODE, { visible: true });
  await page.click(SELECTORS.READER_READING_STANDARD_MODE);
  await page.reload({ waitUntil: 'domcontentloaded' });
}

/**
  * MintManga eighty years alert confirmation
  * @return {Promise<void>}
*/
async function confirmEightyYears() {
  if (await page.$(SELECTORS.EIGHTY_YEAR_AGREE_BUTTON)) {
    await page.click(SELECTORS.EIGHTY_YEAR_AGREE_BUTTON);
  }
}

/**
  * Root page container load wait timeout
  * @return {Promise<void>}
*/
async function waitUntilMangaBoxLoaded() {
  await page.waitForSelector(SELECTORS.ROOT_CONTAINER);
}

/**
  * Download image from url into filePath
  * @param {string} url
  * @param {string} filePath
  * @param {string} name
  * @return {Promise<void>}
*/
async function downloadImage(url, filePath, name) {
  if (fs.existsSync(path.join(filePath, name))) {
    return;
  }

  const file = fs.createWriteStream(path.join(filePath, name));
  const response = await Axios({
    method: 'get',
    url,
    responseType: 'stream',
  });

  await response.data.pipe(file);
}

/**
  * Visit page and wait unti domcontentloaded
  * @param {string} url
  * @return {Promise<void>}
*/
async function visitPage(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
}

/**
  * close puppeteer
  * @return {Promise<void>}
*/
async function terminatePuppeteer() {
  await page.close();
  await browser.close();
}

/**
  * scrap manga name in title manga page
  * @returns {string}
*/
async function getMangaName() {
  await page.waitForSelector(SELECTORS.MANGA_NAME);

  const element = await page.$(SELECTORS.MANGA_NAME);
  const value = await page.evaluate((el) => el.textContent, element);

  return value;
}

/**
  * get config object for chapters scraping
  * @param {string} mangaName
  * @param {CommandArguments} options
  * @return {Promise<void>}
*/
async function getLoopChaptersScrapConfig(mangaName, options) {
  return {
    mangaName,
    chapterElements: await getChapterObjects(),
    UrlOrigin: new URL(options.mangaTitlePage).origin,
    savePath: options.savePath,
  };
}

/**
 *
 * @returns {Promise<number>}
*/
async function getCountOfPages() {
  return await (await page.$(SELECTORS.PAGE)).$$eval('option', (options) => options.length);
}

/**
  * scrap title and link for all mangachapters
  * @return {Promise<Array<ChapterConfiguration>>}
*/
async function getChapterObjects() {
  return (await page.$$eval(
    SELECTORS.CHAPTER_LINK,
    (elements) => elements.map((element) => ({
      link: element.getAttribute('href'),
      title: element.textContent.replace(/\\n/g, '').trim(),
    })),
  )).reverse();
}

/**
  * Scrap all links of chapters
  * @param {number} countOfPages
  * @returns {Array<string>}
*/
async function getPageLinks() {
  const links = [];
  const countOfPages = await getCountOfPages();

  await page.waitForSelector(SELECTORS.NEXT_PAGE_BUTTON);

  for (let index = 1; index <= countOfPages; index++) {
    await page.waitForSelector(SELECTORS.MANGA_IMG);

    const link = await page.$eval(SELECTORS.MANGA_IMG, (element) => element.getAttribute('src'));

    links.push(link);

    if (index < countOfPages) {
      await page.waitForSelector(SELECTORS.NEXT_PAGE_BUTTON);
      await page.click(SELECTORS.NEXT_PAGE_BUTTON);
    }
  }

  return links;
}

/**
 * Check if standard one page mode is setted
 * @returns {Promise<void>}
 */
async function isActiveOnePageModeButton() {
  const { READER_SETTINGS_ACTIVE_BUTTON, READER_READING_STANDARD_MODE } = SELECTORS;
  const selector = `${READER_SETTINGS_ACTIVE_BUTTON} ${READER_READING_STANDARD_MODE}`;

  return await page.$eval(selector, () => true).catch(() => false);
}
