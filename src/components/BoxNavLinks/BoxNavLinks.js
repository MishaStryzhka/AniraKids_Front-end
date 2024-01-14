import { useTranslation } from 'react-i18next';
import { NavList, StyledNavLink } from './BoxNavLinks.styled';

const BoxNavLinks = ({ $mainPage }) => {
  const { t } = useTranslation();
  return (
    <NavList>
      <StyledNavLink $mainPage={$mainPage} to="./forWomen">
        {t("Women's Clothing")}
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./forMen">
        {t("Men's Suits")}
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./forChildren">
        {t("Children's Clothing")}
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./decorAndToys">
        {t('Decor and Toys')}
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./aboutUs">
        {t('About Us')}
      </StyledNavLink>
    </NavList>
  );
};

export default BoxNavLinks;
