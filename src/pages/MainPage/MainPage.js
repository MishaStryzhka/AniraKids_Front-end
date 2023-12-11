import { Container } from 'components/Container/Container';
import { useTitle } from 'hooks';

export const MainPage = () => {
  useTitle('AniraK');
  return (
    <Container>
      <p>MainPage</p>
    </Container>
  );
};
