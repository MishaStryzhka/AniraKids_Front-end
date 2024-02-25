import SectionAboutAniraK from 'components/SectionAboutAniraK/SectionAboutAniraK';
import SectionHero from 'components/SectionHero/SectionHero';
import SectionAboutUs from 'components/SectionAboutUs/SectionAboutUs';
import { useAuth, useStorage, useTitle } from 'hooks';
import SectionOurMission from 'components/SectionOurMission/SectionOurMission';
import SectionSimpleSteps from 'components/SectionSimpleSteps/SectionSimpleSteps';
import SectionAreYouReady from 'components/SectionAreYouReady/SectionAreYouReady';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authBySeznam } from '../../redux/auth/operations';
import { useEffect } from 'react';

const MainPage = () => {
  useTitle('AniraK');
  // eslint-disable-next-line no-unused-vars
  let [searchParams, setSearchParams] = useSearchParams();
  const { isLoading, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storage = useStorage();
  const code = searchParams.get('code');

  useEffect(() => {
    const { origin } = new URL(window.location.href);
    const state = searchParams.get('state');

    code &&
      state === storage.get('requestSecretSeznam') &&
      dispatch(
        authBySeznam({
          code: code,
          redirect_uri: origin,
        })
      );

    code && user && navigate('/my-account/profile', { replace: true });
  }, [code, dispatch, navigate, searchParams, setSearchParams, storage, user]);

  return isLoading ? (
    <p>loading</p>
  ) : (
    <>
      <SectionHero />
      <SectionAboutAniraK />
      <SectionAboutUs />
      <SectionOurMission />
      <SectionSimpleSteps />
      <SectionAreYouReady />
    </>
  );
};

export default MainPage;
