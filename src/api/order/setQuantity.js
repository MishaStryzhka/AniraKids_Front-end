import axios from 'axios';

export const setQuantity = async credentials => {
  const res = await axios.patch(`api/order/set_quantity`, credentials);
  return res.data;
};
