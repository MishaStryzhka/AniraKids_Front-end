import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLanguage } from '../../redux/settings/slice';
import { useTranslation } from 'react-i18next';
import {
  ButtonLanguage,
  CurrentLanguage,
  MenuLanguage,
  StyledFooterSelectLanguage,
  StyledIconArrow,
} from './FooterSelectLanguage.styled';
import Iconlanguage from 'images/icons/Iconlanguage';
import theme from 'components/theme';
import { useAuth } from 'hooks';
import { updateLanguage } from '../../redux/settings/operations';

const FooterSelectLanguage = () => {
  const dispatch = useDispatch();
  const { user, currentTheme } = useAuth();
  const [isOpenMenuLanguage, setIsOpenMenuLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const menuRef = useRef(null);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      setIsOpenMenuLanguage(false);
    }
  }, [selectedLanguage]);

  const changeLanguage = language => {
    i18n.changeLanguage(language);
  };

  const handleClickOutside = event => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpenMenuLanguage(false);
    }
  };

  const handleLanguageClick = language => {
    setSelectedLanguage(language);

    user
      ? dispatch(updateLanguage({ language }))
      : dispatch(setLanguage(language));

    changeLanguage(language);
  };

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
      {isOpenMenuLanguage && (
        <MenuLanguage>
          <ButtonLanguage
            active={currentLanguage === 'en'}
            onClick={() => handleLanguageClick('en')}
          >
            EN
          </ButtonLanguage>
          <ButtonLanguage
            active={currentLanguage === 'cs'}
            onClick={() => handleLanguageClick('cs')}
          >
            CZ
          </ButtonLanguage>
          <ButtonLanguage
            active={currentLanguage === 'uk'}
            onClick={() => handleLanguageClick('uk')}
          >
            UKR
          </ButtonLanguage>
        </MenuLanguage>
      )}
    </StyledFooterSelectLanguage>
  );
};

export default FooterSelectLanguage;
