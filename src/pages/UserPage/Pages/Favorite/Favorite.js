import NotFound from 'components/NotFound/NotFound';
import UsersProductCard from 'components/UsersProductCard/UsersProductCard';
import { useEffect, useState } from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { ListCards } from './Favorite.styled';

const api = require('../../../../api');

const Favorite = () => {
  const { id } = useParams();
  // eslint-disable-next-line no-unused-vars
  const [page, setPage] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [pageSize, setPageSize] = useState(9);

  const [products, setProducts] = useState([]);

  // eslint-disable-next-line no-unused-vars
  const [totalProducts, setTotalProducts] = useState();

  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState();

  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setIsLoading(true);

    api
      .getFavorites({
        page,
        pageSize,
      })
      .then(data => {
        setProducts(data.products);
        setTotalProducts(data.totalProducts);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  }, [page, pageSize, searchParams]);

  return id ? (
    <Outlet />
  ) : (
    <>
      {isLoading ? (
        <p>loading...</p>
      ) : products.length ? (
        <>
          <ListCards>
            {products.map(product => (
              <li key={product._id}>
                <UsersProductCard
                  onRemoveFavorite={() =>
                    setProducts(products.filter(el => el._id !== product._id))
                  }
                  product={product}
                />
              </li>
            ))}
          </ListCards>

          {/* <p>page {page}</p> */}
          {pageSize * page < totalProducts && (
            <button
              type="button"
              title="next page"
              onClick={() => setPage(page + 1)}
            >
              next page
            </button>
          )}
          {pageSize < totalProducts && pageSize * page < totalProducts && (
            <button
              type="button"
              title="next load 9 card"
              onClick={() => setPageSize(pageSize + 9)}
            >
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

export default Favorite;
