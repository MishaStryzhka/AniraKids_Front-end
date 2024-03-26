import OrderCard from 'components/OrderCard/OrderCard';
import { List } from './MyOrders.styled';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
const api = require('../../../../api');

const MyOrders = () => {
  const location = useLocation();
  console.log(location);
  const [isLoading, setIsLoading] = useState(true);
  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(9);
  // const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setIsLoading(true);

    api
      .getProducts()
      .then(data => {
        setOrders(data.products);
        console.log(data);
        setIsLoading(false);
      })
      .catch(error => {
        // setError(error);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      {isLoading ? (
        <p>Loading</p>
      ) : (
        <List>
          {orders?.map(order => (
            <li key={order?._id}>
              <OrderCard state={location} product={order} />
            </li>
          ))}
        </List>
      )}
    </>
  );
};

export default MyOrders;
