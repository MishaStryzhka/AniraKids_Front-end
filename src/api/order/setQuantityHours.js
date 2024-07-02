import axios from 'axios';

export const setQuantityHours = async credentials => {
  const res = await axios.patch(`api/order/set_quantity_hours`, credentials);
  return res.data;
};
