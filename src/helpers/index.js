const { default: getCroppedImg } = require('./cropImage');
const { arrayFamilyLookProduct } = require('../data/dateForProduct');
const { arrayOfSubjectsProduct } = require('../data/dateForProduct');
const { arrayColorsProduct } = require('../data/dateForProduct');
const { arrayAgeProduct } = require('../data/dateForProduct');
const { arraySizeChildrenProduct } = require('../data/dateForProduct');
const { arrayofDecorProduct } = require('../data/dateForProduct');
const { arrayOfToysProduct } = require('../data/dateForProduct');
const { arraySizeAdult } = require('../data/dateForProduct');
const { arrayAnswers } = require('../data/arrayAnswers');
const { arraySaleOrRent } = require('../data/dateForProduct');
const { detectLanguageFromStore } = require('./detectLanguageFromStore');

module.exports = {
  getCroppedImg,
  arrayFamilyLookProduct,
  arrayOfSubjectsProduct,
  arrayColorsProduct,
  arrayAgeProduct,
  arraySizeChildrenProduct,
  arrayofDecorProduct,
  arrayOfToysProduct,
  arraySizeAdult,
  arrayAnswers,
  arraySaleOrRent,
  detectLanguageFromStore,
};
