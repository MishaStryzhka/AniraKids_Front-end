import { Container } from 'components/Container/Container';
import GeneralTitle from 'components/GeneralTitle/GeneralTitle';
import MainContent from 'components/MainContent/MainContent';
import NavigationOverlay from 'components/NavigationOverlay/NavigationOverlay';
import SideBar from 'components/SideBar/SideBar';
import { useTitle } from 'hooks';

export const ForWomenPage = () => {
  useTitle('ЖІНОЧІ НАРЯДИ');

  return (
    <>
      <Container>
        <NavigationOverlay />
        <title>ЖІНОЧІ НАРЯДИ</title>
        <GeneralTitle>ЖІНОЧІ НАРЯДИ</GeneralTitle>
        <div>
          <SideBar />
          <MainContent />
        </div>
      </Container>
    </>
  );
};
