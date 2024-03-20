import RentalCard from 'components/RentalCard/RentalCard';
import { useEffect, useState } from 'react';
import { List } from './RentIn.styled';

const api = require('../../../../api');

const RentIn = () => {
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
              <RentalCard product={product} />
            </li>
          ))}
        </List>
      )}
    </>
  );
};

export default RentIn;
