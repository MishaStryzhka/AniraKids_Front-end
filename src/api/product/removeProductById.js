import axios from 'axios';

export const removeProductById = async id => {
  try {
    const res = await axios.delete(`api/product/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error removing product:', error);
    throw error;
  }
};
