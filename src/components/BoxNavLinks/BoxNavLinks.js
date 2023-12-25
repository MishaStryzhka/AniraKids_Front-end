import { NavList, StyledNavLink } from './BoxNavLinks.styled';

const BoxNavLinks = ({ $mainPage }) => {
  return (
    <NavList>
      <StyledNavLink $mainPage={$mainPage} to="./forWomen">
        Жіночі наряди
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./forMen">
        Чоловічі костюми
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./forChildren">
        Дитячі наряди
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./decorAndToys">
        Декор та іграшки
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./aboutUs">
        Про нас
      </StyledNavLink>
    </NavList>
  );
};

export default BoxNavLinks;
