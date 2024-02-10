const { addProduct } = require('./addProduct');
const { getCurrentUserProducts } = require('./getCurrentUserProducts');
const { removeProductById } = require('./removeProductById');

module.exports = {
  getCurrentUserProducts,
  addProduct,
  removeProductById,
};
