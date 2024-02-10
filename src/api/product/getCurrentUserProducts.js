import axios from 'axios';

export const getCurrentUserProducts = async ({ page, pageSize }) => {
  const res = await axios.get(`api/product/getCurrentUserProducts`, {
    params: { page, pageSize },
  });

  return res.data;
};
