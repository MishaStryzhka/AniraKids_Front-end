// import { useDispatch } from 'react-redux';
// import { setLanguage } from '../../redux/settings/slice';
import { useTranslation } from 'react-i18next';
import {
  CurrentLanguage,
  StyledFooterSelectLanguage,
  StyledIconArrow,
} from './FooterSelectLanguage.styled';
import Iconlanguage from 'images/icons/Iconlanguage';
import { useEffect, useRef, useState } from 'react';
import theme from 'components/theme';
import { useAuth } from 'hooks';

const FooterSelectLanguage = () => {
  const { currentTheme } = useAuth();
  const [isOpenMenuLanguage, setIsOpenMenuLanguage] = useState(false);

  // const dispatch = useDispatch();
  const { i18n } = useTranslation();

  // const changeLanguage = language => {
  //   i18n.changeLanguage(language);
  // };

  const currentLanguage = i18n.language;

  console.log('currentLanguage', currentLanguage);

  const menuRef = useRef(null);

  const handleClickOutside = event => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpenMenuLanguage(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <StyledFooterSelectLanguage
      ref={menuRef}
      onClick={() => setIsOpenMenuLanguage(true)}
    >
      <Iconlanguage />
      <CurrentLanguage>
        {currentLanguage === 'uk' && 'UKR'}
        {currentLanguage === 'en' && 'EN'}
        {currentLanguage === 'cs' && 'CZ'}
      </CurrentLanguage>
      <StyledIconArrow
        fill={theme[currentTheme].mainColor2}
        $isOpenMenuLanguage={isOpenMenuLanguage}
      />
      {/* <button
        onClick={() => {
          dispatch(setLanguage('en'));
          changeLanguage('en');
        }}
      >
        English
      </button>
      <button
        onClick={() => {
          dispatch(setLanguage('cs'));
          changeLanguage('cs');
        }}
      >
        Czech
      </button>
      <button
        onClick={() => {
          dispatch(setLanguage('uk'));
          changeLanguage('uk');
        }}
      >
        Українська
      </button> */}
    </StyledFooterSelectLanguage>
  );
};

export default FooterSelectLanguage;
