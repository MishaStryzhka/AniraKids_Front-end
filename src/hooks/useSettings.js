import { useSelector } from 'react-redux';
import { selectCurrentTheme } from '../redux/settings/selectors';

export const useSettings = () => {
    const currentTheme = useSelector(selectCurrentTheme);

    return {
        currentTheme,
    };
};
