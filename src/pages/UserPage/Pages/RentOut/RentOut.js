import NotFound from 'components/NotFound/NotFound';
import { Outlet, useLocation } from 'react-router-dom';

const RentOut = () => {
  const location = useLocation();

  return (
    <>
      {location.pathname.includes('add-product') ? (
        <Outlet />
      ) : (
        <NotFound>Тут поки пусто</NotFound>
      )}
    </>
  );
};

export default RentOut;
