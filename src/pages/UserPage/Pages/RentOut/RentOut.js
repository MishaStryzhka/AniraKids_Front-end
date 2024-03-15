import NotFound from 'components/NotFound/NotFound';
import UsersProductCard from 'components/UsersProductCard/UsersProductCard';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { ListProducts } from './RentOut.styled';
import ModalConfirm from 'components/Modals/ModalConfirm/ModalConfirm';
import { useTranslation } from 'react-i18next';

const api = require('../../../../api');

const RentOut = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.rentOut',
  });
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productForRemove, setProductForRemove] = useState(false);

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

  const handleRemove = async product => {
    setProductForRemove(product);
    // await api.removeProductById(product);
    // setProducts(products.filter(el => el._id !== product._id));
  };

  const handleUpdate = productId => {
    navigation(`/my-account/rent-out/update-product/${productId}`);
  };
  return id ? (
    <Outlet />
  ) : (
    <>
      {isLoading ? (
        <p>loading...</p>
      ) : products.length ? (
        <>
          <ListProducts>
            {products.map(product => (
              <li key={product._id}>
                <UsersProductCard
                  product={product}
                  handleRemove={handleRemove}
                  handleUpdate={handleUpdate}
                />
              </li>
            ))}
          </ListProducts>
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
        <NotFound>{t('Here is empty')}</NotFound>
      )}
      {productForRemove && (
        <ModalConfirm
          onCloseModal={() => setProductForRemove(false)}
          confirm={async () => {
            await api.removeProductById(productForRemove._id);
            setProducts(
              products.filter(product => product._id !== productForRemove._id)
            );
          }}
          title={t('removeProduct')}
          description={productForRemove.name}
        />
      )}
    </>
  );
};

export default RentOut;
