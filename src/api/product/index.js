const { addProduct } = require('./addProduct');
const { getCurrentUserProducts } = require('./getCurrentUserProducts');
const { getProducts } = require('./getProducts');
const { removeProductById } = require('./removeProductById');

module.exports = {
  getCurrentUserProducts,
  addProduct,
  removeProductById,
  getProducts,
};
