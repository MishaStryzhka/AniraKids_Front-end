import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from './components/App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './redux/store';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ComponentTranslationsUk } from 'components/translations/uk';
import { ComponentTranslationsCs } from 'components/translations/cs';
import { ComponentTranslationsEn } from 'components/translations/en';

import { detectLanguageFromStore } from 'helpers/detectLanguageFromStore';
import { PagesTranslationsCs } from 'pages/translations/cs';
import { PagesTranslationsEn } from 'pages/translations/en';
import { PagesTranslationsUk } from 'pages/translations/uk';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { APIProvider } from '@vis.gl/react-google-maps';
import { dataTranslationsUk } from 'data/translations/uk';
import { dataTranslationsCs } from 'data/translations/cs';
import { dataTranslationsEn } from 'data/translations/en';

const persistLanguage = JSON.parse(
  localStorage.getItem('persist:settings')
)?.language.replace(/^"(.*)"$/, '$1');

i18n.use(LanguageDetector).init({
  interpolation: {
    escapeValue: false, // реагує на HTML-теги у тексті
  },
  lng: persistLanguage || detectLanguageFromStore() || 'cs',
  resources: {
    uk: {
      translation: {
        ...ComponentTranslationsUk,
        components: ComponentTranslationsUk,
        pages: PagesTranslationsUk,
        data: dataTranslationsUk,
      },
    },
    cs: {
      translation: {
        ...ComponentTranslationsCs,
        components: ComponentTranslationsCs,
        pages: PagesTranslationsCs,
        data: dataTranslationsCs,
      },
    },
    en: {
      translation: {
        ...ComponentTranslationsEn,
        components: ComponentTranslationsEn,
        pages: PagesTranslationsEn,
        data: dataTranslationsEn,
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_DI}>
    <APIProvider apiKey={'AIzaSyD9M_UvPQJNBGQqGp3RswMsdMJ1_GDcaQI'}>
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
              <React.Suspense fallback="loading...">
                <App />
              </React.Suspense>
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </I18nextProvider>
    </APIProvider>
  </GoogleOAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
