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

i18n.use(LanguageDetector).init({
  interpolation: {
    escapeValue: false, // реагує на HTML-теги у тексті
  },
  lng: 'uk', // встановлення початкової мови
  resources: {
    uk: {
      translation: { ...ComponentTranslationsUk },
    },
    cs: {
      translation: { ...ComponentTranslationsCs },
    },
    en: {
      translation: { ...ComponentTranslationsEn },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
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
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
