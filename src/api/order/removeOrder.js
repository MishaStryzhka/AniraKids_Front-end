import axios from 'axios';

export const removeOrder = async orderId => {
  const res = await axios.delete(`api/order/remove_orders`, {
    params: { orderId },
  });

  return res.data;
};
