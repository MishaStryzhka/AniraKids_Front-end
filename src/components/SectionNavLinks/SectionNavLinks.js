import { StyledNavLink, WrapLinks } from './SectionNavLinks.styled';

const SectionNavLinks = () => {
  return (
    <WrapLinks>
      <StyledNavLink to="./forWomen">Жіночі наряди</StyledNavLink>
      <StyledNavLink to="./forMen">Чоловічі костюми</StyledNavLink>
      <StyledNavLink to="./forChildren">Дитячі наряди</StyledNavLink>
      <StyledNavLink to="./decorAndToys">Декор та іграшки</StyledNavLink>
      <StyledNavLink to="./aboutUs">Про нас</StyledNavLink>
    </WrapLinks>
  );
};

export default SectionNavLinks;
