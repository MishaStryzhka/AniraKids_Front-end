import { useLocation } from 'react-router-dom';

const { BorderBottom } = require('./Border.styled');

const Border = () => {
  const { pathname } = useLocation();
  return <BorderBottom $mainPage={pathname === `/`} />;
};

export default Border;
