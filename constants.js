const ROOT_CONTAINER = '#mangaBox';
const MANGA_NAME = '.name';
const READ_FIRST_CHAPTER = '.read-first-chapter';
const MANGA_CONTENT = '#fotocontext';
const CHAPTER = '.mobile-chapters-list';
const CHAPTER_ITEM = `${CHAPTER} .item-row`;
const CHAPTER_LINK = `${CHAPTER_ITEM} a`;
const MANGA_IMG = '.manga-img';
const READER_SETTINGS_BUTTON = '.resize.btn';
const READER_SETTINGS_MODAL = '#reader-settings-modal';
const READER_SETTINGS_MODAL_CLOSE_BUTTON = `${READER_SETTINGS_MODAL} .close`;
const READER_SETTINGS_BUTTON_GROUP = '.reader-mode';
const READER_SETTINGS_ACTIVE_BUTTON = `${READER_SETTINGS_BUTTON_GROUP} .active`;
const READER_READING_STANDARD_MODE = 'input[value="standard"]';
const PAGE = '.page-selector';
const NEXT_PAGE_BUTTON = '.nextButton';
const EIGHTY_YEAR_AGREE_BUTTON = '.chapter-link.proxyFragment.manga-mtr';

module.exports = {
  SELECTORS: {
    ROOT_CONTAINER,
    MANGA_NAME,
    READ_FIRST_CHAPTER,
    MANGA_CONTENT,
    CHAPTER,
    CHAPTER_ITEM,
    CHAPTER_LINK,
    MANGA_IMG,
    READER_SETTINGS_BUTTON,
    READER_SETTINGS_MODAL,
    READER_SETTINGS_MODAL_CLOSE_BUTTON,
    READER_SETTINGS_BUTTON_GROUP,
    READER_SETTINGS_ACTIVE_BUTTON,
    READER_READING_STANDARD_MODE,
    PAGE,
    NEXT_PAGE_BUTTON,
    EIGHTY_YEAR_AGREE_BUTTON,
  },
  MANGA_SERVICES: ['readmanga', 'mintmanga'],
  ERRORS: {
    INVALID_MANGA_SERVICE: 'Incorrect manga service please use readmanga or mintmanga',
    INVALID_DESTINATION_FOLDER: 'Incorrect destination folder please use absolute path',
  },
};
