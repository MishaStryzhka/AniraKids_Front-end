import axios from 'axios';

export const getProducts = async params => {
  const res = await axios.get(`api/product/getProducts`, { params });

  return res.data;
};
