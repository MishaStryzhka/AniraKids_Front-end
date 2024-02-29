import SearchInput from 'components/SearchInput/SearchInput';
import {
  Button,
  ModalWindow,
  Wrap,
  WrapBoxLink,
  WrapBoxNav,
} from './ModalBurgerMenu.styled';

import BoxNavigation from 'components/BoxNavigation/BoxNavigation';
import IconCross from 'images/icons/IconCross';
import BoxNavLinks from 'components/BoxNavLinks/BoxNavLinks';

const ModalBurgerMenu = ({ onClick }) => {
  return (
    <ModalWindow>
      <Wrap>
        <SearchInput />
        <Button
          onClick={() => {
            document.body.style.overflow = 'auto';
            onClick();
          }}
        >
          <IconCross />
        </Button>
      </Wrap>
      <WrapBoxNav>
        <BoxNavigation onClick={onClick} />
      </WrapBoxNav>

      <WrapBoxLink>
        <BoxNavLinks
          onClick={() => {
            document.body.style.overflow = 'auto';
            onClick();
          }}
          // $mainPage={pathname === `/`}
        />
      </WrapBoxLink>
    </ModalWindow>
  );
};

export default ModalBurgerMenu;
