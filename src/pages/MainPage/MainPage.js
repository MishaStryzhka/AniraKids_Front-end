import SectionAboutAniraK from 'components/SectionAboutAniraK/SectionAboutAniraK';
import SectionHero from 'components/SectionHero/SectionHero';
import SectionAboutUs from 'components/SectionAboutUs/SectionAboutUs';
import { useTitle } from 'hooks';
import SectionOurMission from 'components/SectionOurMission/SectionOurMission';
import SectionSimpleSteps from 'components/SectionSimpleSteps/SectionSimpleSteps';
import SectionAreYouReady from 'components/SectionAreYouReady/SectionAreYouReady';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authBySeznam } from '../../redux/auth/operations';

const MainPage = () => {
  // eslint-disable-next-line no-unused-vars
  let [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const code = searchParams.get('code');
  // const state = searchParams.get('state');
  // console.log('code', code);
  // console.log('state', state);

  const { origin } = new URL(window.location.href);

  code &&
    dispatch(
      authBySeznam({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: origin,
        client_secret: process.env.REACT_APP_SEZNAM_CLIENT_SECRET,
        client_id: process.env.REACT_APP_SEZNAM_CLIENT_ID,
      })
    );

  useTitle('AniraK');
  return (
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
