import axios from 'axios';

export const getProductById = async id => {
  const res = await axios.get(`api/product/getProductById/${id}`);

  return res.data;
};
