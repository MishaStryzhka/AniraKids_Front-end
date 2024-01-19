import { useSelector } from 'react-redux';
import {
  selectLanguage,
  selectCurrentTheme,
} from '../redux/settings/selectors';

export const useSettings = () => {
  const currentTheme = useSelector(selectCurrentTheme);
  const currentLanguage = useSelector(selectLanguage);

  return {
    currentTheme,
    currentLanguage,
  };
};
