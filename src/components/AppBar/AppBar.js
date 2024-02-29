import { useLocation } from 'react-router-dom';
import {
  BoxShadow,
  ButtonMenu,
  ContainerAppBar,
  FirstHeader,
  SecondHeader,
  WrapBoxNav,
  WrapSearch,
  Wrapper,
} from './AppBar.styled';
import Logo from '../Logo/Logo';
import SearchInput from '../SearchInput/SearchInput';
import BoxNavigation from '../BoxNavigation/BoxNavigation';
import BoxNavLinks from '../BoxNavLinks/BoxNavLinks';
import { Container } from 'components/Container/Container';
import IconBurgerMenu from 'images/icons/IconBurgerMenu';
import { useState } from 'react';
import Modal from 'components/Modals/Modal';
import ModalBurgerMenu from 'components/Modals/ModalBurgerMenu/ModalBurgerMenu';

const AppBar = () => {
  const [isModal, setIsModal] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      <BoxShadow $mainPage={pathname === `/`}>
        <Container>
          <ContainerAppBar $mainPage={pathname === `/`}>
            <FirstHeader>
              <Logo $isHeader />
              <ButtonMenu type="button" onClick={() => setIsModal(true)}>
                <IconBurgerMenu />
              </ButtonMenu>
              {isModal && (
                <Modal
                // onClick={() => {
                //   setIsModal(false);
                // }}
                >
                  <ModalBurgerMenu onClick={() => setIsModal(false)} />
                </Modal>
              )}
              <Wrapper>
                <WrapSearch>
                  <SearchInput />
                </WrapSearch>
                <WrapBoxNav>
                  <BoxNavigation $mainPage={pathname === `/`} />
                </WrapBoxNav>
              </Wrapper>
            </FirstHeader>
            <SecondHeader>
              <BoxNavLinks $mainPage={pathname === `/`} />
            </SecondHeader>
          </ContainerAppBar>
        </Container>
      </BoxShadow>
    </>
  );
};

export default AppBar;
