// import { Container } from 'components/Container/Container';
import { Title } from './GeneralTitle.styled';
import Border from 'components/Border/Border';

const GeneralTitle = ({ children }) => {
  return (
    <>
      <Title>{children}</Title>
      <Border />
    </>
  );
};
export default GeneralTitle;
