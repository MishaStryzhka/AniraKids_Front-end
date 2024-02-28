import Order from 'components/Order/Order';
import { useEffect, useState } from 'react';

const api = require('../../../../api');

const Cart = () => {
  const [orders, setOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [totalOrders, setTotalOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState([]);

  useEffect(() => {
    api
      .getOrders()
      .then(data => {
        setOrders(data.orders);
        setTotalOrders(data.totalOrders);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  }, []);

  const handleRemoveOrder = orderId => {
    api.removeOrder(orderId).then(({ message }) => {
      message === 'Order successfully removed' &&
        setOrders(prefOrders =>
          prefOrders.filter(item => item._id !== orderId)
        );
    });
  };

  return !orders.length ? (
    <p>Ваш кошик поки пустий</p>
  ) : (
    <>
      {orders.map(order => (
        <Order
          handleRemoveOrder={() => handleRemoveOrder(order._id)}
          key={order._id}
          order={order}
        />
      ))}
    </>
  );
};

export default Cart;
