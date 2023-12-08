import { Outlet } from 'react-router-dom';
import { Suspense, useState } from 'react';
import Footer from '../Footer/Footer';
import { ContainerLayout, StuledContainer } from './SharedLayout.styled';
import AppBar from '../AppBar/AppBar';
import { Container } from '../Container/Container';

const SharedLayout = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const closeMenu = e => {
    if (
      e.target.id !== 'btnNavMenu' &&
      e.target.id !== 'navMenu' &&
      e.target.id !== 'navContainer'
    ) {
      setIsOpenMenu(false);
    }
  };

  return (
    <>
      <ContainerLayout $isOpenMenu={isOpenMenu} onClick={closeMenu}>
        <AppBar $isOpenMenu={isOpenMenu} setIsOpenMenu={setIsOpenMenu} />
        <StuledContainer>
          <Container>
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </Container>
        </StuledContainer>
        <Footer />
      </ContainerLayout>
    </>
  );
};

export default SharedLayout;
