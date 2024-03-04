import axios from 'axios';

export const getPopular = async () => {
  const res = await axios.get(`api/product/getPopular`);

  return res.data;
};
