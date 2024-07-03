import EmptyCart from 'components/EmptyCart/EmptyCart';
import Order from 'components/Order/Order';
import { useEffect, useRef, useState } from 'react';
import { ListOrders } from './Cart.styled';
import { useLocation } from 'react-router-dom';
import { removeOrderIdFromUserCart } from '../../../../redux/auth/slice';
import { useDispatch } from 'react-redux';

const api = require('../../../../api');

const Cart = () => {
  const [orders, setOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [totalOrders, setTotalOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();

  const scrollOrderRef = useRef();

  useEffect(() => {
    if (location.hash) {
      const orderId = location.hash.slice(1);
      const orderIndex = orders.findIndex(order => order._id === orderId);
      if (orderIndex !== -1 && scrollOrderRef.current) {
        scrollOrderRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }, [location.hash, orders]);

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
      if (message === 'Order successfully removed') {
        setOrders(prefOrders =>
          prefOrders.filter(item => item._id !== orderId)
        );
        dispatch(removeOrderIdFromUserCart(orderId));
      }
    });
  };

  return !orders.length ? (
    <EmptyCart />
  ) : (
    <ListOrders>
      {orders.map(order => (
        <li
          key={order._id}
          ref={order._id === location.hash.slice(1) ? scrollOrderRef : null}
        >
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
