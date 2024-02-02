import { useLocation } from 'react-router-dom';
import {
  BoxShadow,
  ButtonMenu,
  ContainerAppBar,
  FirstHeader,
  Item,
  List,
  SecondHeader,
  WrapBoxNav,
  WrapSearch,
} from './AppBar.styled';
import Logo from '../Logo/Logo';
import SearchInput from '../SearchInput/SearchInput';
import BoxNavigation from '../BoxNavigation/BoxNavigation';
import BoxNavLinks from '../BoxNavLinks/BoxNavLinks';
import { Container } from 'components/Container/Container';
import { useTranslation } from 'react-i18next';
import IconBurgerMenu from 'images/icons/IconBurgerMenu';
import { useState } from 'react';
import Modal from 'components/Modals/Modal';
import ModalBurgerMenu from 'components/Modals/ModalBurgerMenu/ModalBurgerMenu';

const AppBar = () => {
  const [isModal, setIsModal] = useState(false);
  const { pathname } = useLocation();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.appBar',
  });
  const isOpenModal = () => {
    setIsModal(true);
  };

  const closeModal = () => {
    setIsModal(false);
  };
  return (
    <>
      <BoxShadow $mainPage={pathname === `/`}>
        <Container>
          <ContainerAppBar $mainPage={pathname === `/`}>
            <FirstHeader>
              <List>
                <Item $mainPage={pathname === `/`}>{t('Women')}</Item>
                <Item $mainPage={pathname === `/`}>{t('Men')}</Item>
                <Item $mainPage={pathname === `/`}>{t('Children')}</Item>
              </List>
              <Logo />
              <ButtonMenu type="button" onClick={isOpenModal}>
                <IconBurgerMenu />
              </ButtonMenu>
              {isModal && (
                <Modal
                  onClick={() => {
                    setIsModal(false);
                  }}
                >
                  <ModalBurgerMenu onClick={closeModal} />
                </Modal>
              )}
              <WrapSearch>
                <SearchInput />
              </WrapSearch>
              <WrapBoxNav>
                <BoxNavigation $mainPage={pathname === `/`} />
              </WrapBoxNav>
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
