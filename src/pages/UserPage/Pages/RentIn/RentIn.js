import RentalCard from 'components/RentalCard/RentalCard';
import { useEffect, useState } from 'react';
import { List } from './RentIn.styled';

const api = require('../../../../api');

const RentIn = () => {
  const [isLoading, setIsLoading] = useState(true);
  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(9);

  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setIsLoading(true);

    api
      .getOrdersRent()
      .then(({ totalOrders, orders }) => {
        setOrders(orders);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
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
              <RentalCard order={order} />
            </li>
          ))}
        </List>
      )}
    </>
  );
};

export default RentIn;
