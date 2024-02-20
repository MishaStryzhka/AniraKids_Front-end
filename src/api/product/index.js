const { addProduct } = require('./addProduct');
const { getCurrentUserProducts } = require('./getCurrentUserProducts');
const { getFavorites } = require('./getFavorites');
const { getProductById } = require('./getProductById');
const { getProducts } = require('./getProducts');
const { removeProductById } = require('./removeProductById');

module.exports = {
  getCurrentUserProducts,
  addProduct,
  removeProductById,
  getProducts,
  getFavorites,
  getProductById,
};
