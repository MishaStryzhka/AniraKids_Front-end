import { ForChildrenPageTranslationsCs } from 'pages/ForChildrenPage/translations/cs';
import { ForMenPageTranslationsCs } from 'pages/ForMenPage/translations/cs';
import { ForWomenPageTranslationsCs } from 'pages/ForWomenPage/translations/cs';
import { UserPageTranslationsCs } from 'pages/UserPage/translations/cs';

export const PagesTranslationsCs = {
  ...ForWomenPageTranslationsCs,
  ...ForMenPageTranslationsCs,
  ...ForChildrenPageTranslationsCs,
  userPage: UserPageTranslationsCs,
};
