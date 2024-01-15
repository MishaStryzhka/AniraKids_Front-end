import { useSelector } from 'react-redux';
import {
  selectCurrentLanguage,
  selectCurrentTheme,
} from '../redux/settings/selectors';

export const useSettings = () => {
  const currentTheme = useSelector(selectCurrentTheme);
  const currentLanguage = useSelector(selectCurrentLanguage);

  return {
    currentTheme,
    currentLanguage,
  };
};
