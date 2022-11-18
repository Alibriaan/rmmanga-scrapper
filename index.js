#!/usr/bin/env node
/** @module Scraper */
/*
 WEB SCRAPER FOR READMANGA AND MINTMANGA SERVICES
*/
const { Command } = require('commander');
const { log, error } = require('./chalk');
const scrap = require('./scraper');
const { version, name } = require('./package.json');
const { cliArgumentsSchema } = require('./validation');

const program = new Command();

program
  .name(name)
  .description('simple cli for readmanga and mintmanga content scrapping')
  .version(version, '-version, --V', 'Current version')
  .argument('<manga title page url>', 'manga title page example: https://readmanga.live/van_pis__A5664')
  .argument('<save path>', 'absolute path to save destination')
  .action(scrapCommandAction);

program.parse();

/**
 *
 * @param {string} mangaTitlePage
 * @param {string} savePath
 * @returns {void}
 */
function scrapCommandAction(mangaTitlePage, savePath) {
  const validationResult = cliArgumentsSchema.validate({ mangaTitlePage, savePath });

  if (validationResult.error) {
    validationResult.error.details.forEach((detail) => log(error(detail.type)));
    return;
  }

  scrap({ mangaTitlePage, savePath });
}
