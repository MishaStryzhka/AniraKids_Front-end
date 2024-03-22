import { useTranslation } from 'react-i18next';
import { NavList, StyledNavLink } from './BoxNavLinks.styled';

const BoxNavLinks = ({ $mainPage, onClick }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.boxNavLinks',
  });
  return (
    <NavList $mainPage={$mainPage}>
      <StyledNavLink $mainPage={$mainPage} to="./forWomen" onClick={onClick}>
        {t("Women's Clothing")}
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./forMen" onClick={onClick}>
        {t("Men's Suits")}
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./forChildren" onClick={onClick}>
        {t("Children's Clothing")}
      </StyledNavLink>
      <StyledNavLink
        $mainPage={$mainPage}
        to="./decorAndToys"
        onClick={onClick}
      >
        {t('Decor and Toys')}
      </StyledNavLink>
      <StyledNavLink $mainPage={$mainPage} to="./aboutUs" onClick={onClick}>
        {t('About Us')}
      </StyledNavLink>
    </NavList>
  );
};

export default BoxNavLinks;
