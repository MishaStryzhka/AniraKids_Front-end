const {
  productSubjects,
  arrayFamilyLookProductMen,
  arrayFamilyLookProductWomen,
  arrayOfOutfits,
} = require('./dateForProduct');
const { arrayColorsProduct } = require('./dateForProduct');
const { arrayAgeProduct } = require('./dateForProduct');
const { arrayofDecorProduct } = require('./dateForProduct');
const { arrayOfToysProduct } = require('./dateForProduct');
const { arraySizeAdult } = require('./dateForProduct');
const { arrayAnswers } = require('./arrayAnswers');
const { arraySaleOrRent } = require('./dateForProduct');
const { arrayChildSizeProduct } = require('./arrayChildSize/arrayChildSize');

module.exports = {
  arrayFamilyLookProductMen,
  arrayFamilyLookProductWomen,
  productSubjects,
  arrayColorsProduct,
  arrayAgeProduct,
  arraySizeChildrenProduct: arrayChildSizeProduct,
  arrayofDecorProduct,
  arrayOfToysProduct,
  arraySizeAdult,
  arrayAnswers,
  arraySaleOrRent,
  arrayOfOutfits,
};
