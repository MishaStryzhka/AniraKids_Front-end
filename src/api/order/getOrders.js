import axios from 'axios';

export const getOrders = async params => {
  const res = await axios.get(`api/order/get_orders`, { params });

  return res.data;
};
