import axios from 'axios';

export const getOrdersRent = async () => {
  const res = await axios.get(`api/order/get_orders_rent`);

  return res.data;
};
