import SearchInput from 'components/SearchInput/SearchInput';
import {
  Button,
  ModalWindow,
  Wrap,
  WrapBoxLink,
  WrapBoxNav,
} from './ModalBurgerMenu.styled';
import { useTranslation } from 'react-i18next';
import BoxNavigation from 'components/BoxNavigation/BoxNavigation';
import IconCross from 'images/icons/IconCross';
import BoxNavLinks from 'components/BoxNavLinks/BoxNavLinks';

const ModalBurgerMenu = ({ onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.modalChangePhoto',
  });
  console.log(t);
  return (
    <ModalWindow>
      <Wrap>
        <SearchInput />
        <Button>
          <IconCross
            onClick={() => {
              // document.body.style.overflow = 'auto';
              onClick();
            }}
          />
        </Button>
      </Wrap>
      <WrapBoxNav>
        <BoxNavigation />
      </WrapBoxNav>

      <WrapBoxLink>
        <BoxNavLinks
          onClick={onClick}
          // $mainPage={pathname === `/`}
        />
      </WrapBoxLink>
    </ModalWindow>
  );
};

export default ModalBurgerMenu;
