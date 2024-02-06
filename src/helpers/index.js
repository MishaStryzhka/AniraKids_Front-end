const { default: getCroppedImg } = require('./cropImage');
const { arrayFamilyLookProduct } = require('./dateForProduct');
const { arrayOfSubjectsProduct } = require('./dateForProduct');
const { arrayColorsProduct } = require('./dateForProduct');
const { arrayAgeProduct } = require('./dateForProduct');
const { arraySizeChildrenProduct } = require('./dateForProduct');
const { arrayofDecorProduct } = require('./dateForProduct');
const { arrayOfToysProduct } = require('./dateForProduct');
const { arraySizeAdult } = require('./dateForProduct');
const { arrayAnswers } = require('./arrayAnswers');
const { arraySaleOrRent } = require('./dateForProduct');
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
