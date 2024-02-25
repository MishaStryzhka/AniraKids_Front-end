import { useGoogleOAuth } from '@react-oauth/google';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { authBySeznam } from '../../redux/auth/operations';
import { nanoid } from '@reduxjs/toolkit';

const Main = () => {
  const [searchParams, setSearchParams] = useParams();
  const { isLoading, user } = useGoogleOAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    const { origin } = new URL(window.location.href);
    const state = searchParams.get('state');

    code &&
      state === localStorage.getItem('requestSecretSeznam') &&
      dispatch(
        authBySeznam({
          code: code,
          redirect_uri: origin,
        })
      );

    code && user && navigate('/my-account/profile', { replace: true });
  }, [code, dispatch, navigate, searchParams, setSearchParams, user]);

  const requestSecretSeznam = nanoid();
  localStorage.setItem('requestSecretSeznam', requestSecretSeznam);
  const { origin } = new URL(window.location.href);

  return isLoading ? (
    <p>loading...</p>
  ) : (
    <NavLink
      href={`https://login.szn.cz/api/v1/oauth/auth
      ?client_id=${process.env.REACT_APP_SEZNAM_CLIENT_ID}
      &scope=identity
      &response_type=code
      &redirect_uri=${origin}
      &state=${requestSecretSeznam}`}
    >
      <StyledSeznamWrap>
        <IconSeznamLogoEskoCervena />
      </StyledSeznamWrap>
    </NavLink>
  );
};

export default Main;
