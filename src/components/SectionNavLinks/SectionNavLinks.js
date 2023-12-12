import { StyledNavLink, WrapLinks } from './SectionNavLinks.styled';

const SectionNavLinks = ({ $mainPage }) => {
  return (
    <WrapLinks>
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
    </WrapLinks>
  );
};

export default SectionNavLinks;
