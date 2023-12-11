import { Container } from 'components/Container/Container';
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
        <div>
          <SideBar />
          <MainContent />
        </div>
      </Container>
    </>
  );
};
