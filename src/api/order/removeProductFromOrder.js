import axios from 'axios';

export const removeProductFromOrder = async (orderId, productId) => {
  console.log('orderId, productId', orderId, productId);

  const res = await axios.delete(`api/order/remove_product_from_order`, {
    params: {
      orderId,
      productId,
    },
  });

  return res.data;
};
