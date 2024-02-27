import axios from 'axios';

export const addToOrder = async credentials => {
  console.log('credentials', credentials);

  const res = await axios.post(`api/order/add`, credentials);

  console.log('res.data', res.data);
  return res.data;
};
