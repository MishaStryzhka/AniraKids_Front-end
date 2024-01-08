import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { confirmUserEmail } from '../../redux/auth/operations';

const ConfirmEmailPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useDispatch();

  false && setSearchParams();

  useEffect(() => {
    dispatch(confirmUserEmail({ token: token }));
  }, [dispatch, token]);

  console.log('token', token);

  return <p>ConfirmEmailPage</p>;
};

export default ConfirmEmailPage;
