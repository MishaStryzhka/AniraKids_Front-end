// import IconBeauty from 'images/icons/IconBeauty';
import { StyledIconBeauty, Text, WrapNotFound } from './NotFound.styled';

const NotFound = ({ children }) => {
  return (
    <WrapNotFound>
      <StyledIconBeauty />
      <Text>{children}</Text>
    </WrapNotFound>
  );
};

export default NotFound;
