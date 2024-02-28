const { addToOrder } = require('./order/addToOrder');
const { getOrders } = require('./order/getOrders');
const { removeOrder } = require('./order/removeOrder');
const { removeProductFromOrder } = require('./order/removeProductFromOrder');
const { setQuantity } = require('./order/setQuantity');
const { addProduct } = require('./product/addProduct');
const { getCurrentUserProducts } = require('./product/getCurrentUserProducts');
const { getFavorites } = require('./product/getFavorites');
const { getProductById } = require('./product/getProductById');
const { getProducts } = require('./product/getProducts');
const { removeProductById } = require('./product/removeProductById');

module.exports = {
  // Product
  addProduct,
  getProducts,
  getFavorites,
  getProductById,
  getCurrentUserProducts,
  removeProductById,

  // Order
  addToOrder,
  getOrders,
  setQuantity,
  removeOrder,
  removeProductFromOrder,
};
