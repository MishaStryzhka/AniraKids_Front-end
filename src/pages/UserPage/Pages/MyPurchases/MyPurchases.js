import OrderCard from 'components/OrderCard/OrderCard';
import { List } from './MyPurchases.styled';
import { useEffect, useState } from 'react';
const api = require('../../../../api');

const MyPurchases = () => {
  const [isLoading, setIsLoading] = useState(true);
  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(9);
  // const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setIsLoading(true);

    api
      .getProducts({
        // page,
        // pageSize,
      })
      .then(data => {
        setProducts(data.products);
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
          {products?.map(product => (
            <li key={product?._id}>
              <OrderCard product={product} />
            </li>
          ))}
        </List>
      )}
    </>
  );
};

export default MyPurchases;
