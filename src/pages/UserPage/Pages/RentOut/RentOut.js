import NotFound from 'components/NotFound/NotFound';
import UsersProductCard from 'components/UsersProductCard/UsersProductCard';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const api = require('./../../../../api/product');

console.log('api', api);

const RentOut = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  error && console.log('error', error);

  const navigation = useNavigate();

  useEffect(() => {
    api
      .getCurrentUserProducts({ page, pageSize })
      .then(data => {
        setProducts(data.products);
        setTotalProducts(data.totalProducts);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  }, [page, pageSize]);

  const handleRemove = async productId => {
    await api.removeProductById(productId);
    setProducts(products.filter(product => product._id !== productId));
  };

  const handleUpdate = productId => {
    navigation(`/my-account/rent-out/update-product/${productId}`);
  };

  return (
    <>
      {isLoading ? (
        <p>loading...</p>
      ) : products.length ? (
        <>
          {products.map(product => (
            <UsersProductCard
              key={product._id}
              product={product}
              handleRemove={handleRemove}
              handleUpdate={handleUpdate}
            />
          ))}
          <p>page {page}</p>
          {pageSize * page < totalProducts && (
            <button type="button" onClick={() => setPage(page + 1)}>
              next page
            </button>
          )}
          {pageSize < totalProducts && pageSize * page < totalProducts && (
            <button type="button" onClick={() => setPageSize(pageSize + 9)}>
              next 9
            </button>
          )}
        </>
      ) : (
        <NotFound>Тут поки пусто</NotFound>
      )}
    </>
  );
};

export default RentOut;
