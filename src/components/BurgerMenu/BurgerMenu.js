import SearchInput from 'components/SearchInput/SearchInput';
import { ModalBurgerMenu, StyledIconCross } from './BurgerMenu.styled';

const BurgerMenu = handleCloseMenu => {
  return (
    <ModalBurgerMenu>
      <StyledIconCross
        onClick={() => {
          //   document.body.style.overflow = 'auto';
        }}
      />
      <SearchInput />
    </ModalBurgerMenu>
  );
};

export default BurgerMenu;
