import EmptyCart from 'components/EmptyCart/EmptyCart';
import Order from 'components/Order/Order';
import { useEffect, useState } from 'react';
import { ListOrders } from './Cart.styled';

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
    <EmptyCart />
  ) : (
    <ListOrders>
      {orders.map(order => (
        <li key={order._id}>
          <Order
            handleRemoveOrder={() => handleRemoveOrder(order._id)}
            order={order}
          />
        </li>
      ))}
    </ListOrders>
  );
};

export default Cart;
