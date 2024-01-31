import { Outlet } from 'react-router-dom';
import { Suspense, useState } from 'react';
import Footer from '../Footer/Footer';
import { ContainerLayout, StuledContainer } from './SharedLayout.styled';
import AppBar from '../AppBar/AppBar';

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
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </StuledContainer>
        <Footer />
      </ContainerLayout>
    </>
  );
};

export default SharedLayout;
