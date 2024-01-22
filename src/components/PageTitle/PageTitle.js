// import { Container } from 'components/Container/Container';
import { Title } from './PageTitle.styled';
// import Border from 'components/Border/Border';

const PageTitle = ({ children }) => {
  return (
    <>
      <Title>{children}</Title>
      {/* <Border /> */}
    </>
  );
};
export default PageTitle;
