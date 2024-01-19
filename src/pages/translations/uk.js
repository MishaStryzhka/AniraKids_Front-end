import { ForChildrenPageTranslationsUk } from 'pages/ForChildrenPage/translations/uk';
import { ForMenPageTranslationsUk } from 'pages/ForMenPage/translations/uk';
import { ForWomenPageTranslationsUk } from 'pages/ForWomenPage/translations/uk';
import { UserPageTranslationsUk } from 'pages/UserPage/translations/uk';

export const PagesTranslationsUk = {
  ...ForWomenPageTranslationsUk,
  ...ForMenPageTranslationsUk,
  ...ForChildrenPageTranslationsUk,
  userPage: UserPageTranslationsUk,
};
