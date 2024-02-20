import axios from 'axios';

export const getFavorites = async params => {
  const res = await axios.get(`api/product/getFavorites`, { params });

  return res.data;
};
