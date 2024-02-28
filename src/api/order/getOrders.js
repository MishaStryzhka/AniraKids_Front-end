import axios from 'axios';

export const getOrders = async () => {
  const res = await axios.get(`api/order/get_orders`);

  return res.data;
};
