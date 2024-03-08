import NotFound from 'components/NotFound/NotFound';
import UsersProductCard from 'components/UsersProductCard/UsersProductCard';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ListProducts, SecondBox } from './RentOut.styled';
import Modal from 'components/Modals/Modal';
import ModalRemoveProduct from 'components/Modals/ModalRemoveProduct/ModalRemoveProduct';
import IconPlus from 'images/icons/IconPlus';
import ButtonAdd from 'components/Buttons/ButtonAdd/ButtonAdd';
import { useTranslation } from 'react-i18next';

const api = require('../../../../api');

const RentOut = () => {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isOpenModalRemove, setIsOpenModalRemove] = useState(false);

  error && console.log('error', error);
  const location = useLocation();
  const navigation = useNavigate();

  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.rentOut',
  });

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
    setIsOpenModalRemove(productId);
    // await api.removeProductById(productId);
    // setProducts(products.filter(product => product._id !== productId));
  };

  const handleUpdate = productId => {
    console.log('productId', productId);

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
          <SecondBox>
            {location.pathname === '/my-account/rent-out' && (
              <ButtonAdd to="/my-account/rent-out/add-product">
                {t('addProduct')}
                <IconPlus />
              </ButtonAdd>
            )}
          </SecondBox>
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
        <NotFound>Тут поки пусто</NotFound>
      )}
      {isOpenModalRemove && (
        <Modal>
          <ModalRemoveProduct
            onClick={() => setIsOpenModalRemove(false)}
            onTrue={async () => {
              await api.removeProductById(isOpenModalRemove);
              setProducts(
                products.filter(product => product._id !== isOpenModalRemove)
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default RentOut;
