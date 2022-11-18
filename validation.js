const fs = require('fs');
const Joi = require('joi');
const { MANGA_SERVICES, ERRORS } = require('./constants');

module.exports.cliArgumentsSchema = Joi.object({
  mangaTitlePage: Joi
    .string()
    .required()
    .uri()
    .custom(mangaServicesValidation, 'Valid manga service validation'),
  savePath: Joi
    .string()
    .required()
    .custom(savePathValidation, 'Valid destination folder validation'),
});

/**
 *
 * @param {string} value
 * @param {Joi.CustomHelpers<any>} helpers
 * @returns {string | Joi.ErrorReport}
 */
function mangaServicesValidation(value, helpers) {
  const isValidMangaService = !!MANGA_SERVICES.find((service) => value.includes(service));

  if (!isValidMangaService) return helpers.error(ERRORS.INVALID_MANGA_SERVICE);

  return value;
}

/**
 *
 * @param {string} value
 * @param {Joi.CustomHelpers<any>} helpers
 * @returns {string | Joi.ErrorReport}
 */
function savePathValidation(value, helpers) {
  const isExistedDestinationFolder = fs.existsSync(value);

  if (!isExistedDestinationFolder) return helpers.error(ERRORS.INVALID_DESTINATION_FOLDER);

  return value;
}
