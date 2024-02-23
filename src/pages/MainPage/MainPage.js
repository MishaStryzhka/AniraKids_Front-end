import SectionAboutAniraK from 'components/SectionAboutAniraK/SectionAboutAniraK';
import SectionHero from 'components/SectionHero/SectionHero';
import SectionAboutUs from 'components/SectionAboutUs/SectionAboutUs';
import { useAuth, useTitle } from 'hooks';
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
  const code = searchParams.get('code');

  useEffect(() => {
    const { origin } = new URL(window.location.href);

    code &&
      dispatch(
        authBySeznam({
          code: code,
          redirect_uri: origin,
        })
      );

    code && user && navigate('/my-account/profile', { replace: true });
  }, [code, dispatch, navigate, setSearchParams, user]);

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
