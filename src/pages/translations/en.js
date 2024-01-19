import { ForChildrenPageTranslationsEn } from 'pages/ForChildrenPage/translations/en';
import { ForMenPageTranslationsEn } from 'pages/ForMenPage/translations/en';
import { ForWomenPageTranslationsEn } from 'pages/ForWomenPage/translations/en';
import { UserPageTranslationsEn } from 'pages/UserPage/translations/en';

export const PagesTranslationsEn = {
  ...ForWomenPageTranslationsEn,
  ...ForMenPageTranslationsEn,
  ...ForChildrenPageTranslationsEn,
  userPage: UserPageTranslationsEn,
};
