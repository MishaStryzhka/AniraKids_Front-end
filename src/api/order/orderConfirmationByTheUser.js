import axios from 'axios';

export const orderConfirmationByTheUser = async ({
  orderId,
  ...credentials
}) => {
  const res = await axios.patch(
    `api/order/confirm_by_user/${orderId}`,
    credentials
  );
  return res.data;
};
