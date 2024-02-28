import axios from 'axios';

export const addToOrder = async credentials => {
  const res = await axios.post(`api/order/add`, credentials);
  return res.data;
};
