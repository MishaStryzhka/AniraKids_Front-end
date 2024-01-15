import { useDispatch } from 'react-redux';
import { setLanguage } from '../../redux/settings/slice';
import { useTranslation } from 'react-i18next';

const FooterSelectLanguage = () => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();

  const changeLanguage = language => {
    i18n.changeLanguage(language);
  };

  return (
    <div>
      <button
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
      </button>
    </div>
  );
};

export default FooterSelectLanguage;
