import IconBeauty from 'images/icons/IconBeauty';
import { Text, WrapNotFound } from './NotFound.styled';

const NotFound = ({ children }) => {
  return (
    <WrapNotFound>
      <IconBeauty />
      <Text>{children}</Text>
    </WrapNotFound>
  );
};

export default NotFound;
