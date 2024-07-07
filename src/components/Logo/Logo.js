import { useLocation } from 'react-router-dom';
import { StyledIconLogo, StyledNavLink } from './Logo.styled.js';

const Logo = ({ $isHeader }) => {
  const { pathname } = useLocation();

  return (
    <StyledNavLink $isHeader={$isHeader} to="./">
      <StyledIconLogo
        className="text"
        fill={pathname === '/' ? '#fff' : '#000'}
      ></StyledIconLogo>
      {/* <div className="text">анімоване слово</div> */}
    </StyledNavLink>
  );
};

export default Logo;
