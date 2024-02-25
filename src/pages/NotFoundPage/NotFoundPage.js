import { Container } from 'components/Container/Container';
import { useTranslation } from 'react-i18next';
import {
  Description,
  Picture,
  Span,
  StyledIconGirl,
  Title,
  TitleDescription,
  WrapPage,
  WrapText,
} from './NotFoundPage.styled';
import Button from 'components/Button/Button';
import { NavLink } from 'react-router-dom';

const NotFoundPage = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'pages.notFoundPage',
  });

  return (
    <Container>
      <WrapPage>
        <Picture>
          <StyledIconGirl />
        </Picture>
        <WrapText>
          <Title>
            <Span>4</Span>0<Span>4</Span>
          </Title>
          <TitleDescription>{t('Page not found')}</TitleDescription>
          <Description>{t('Problem explanation')}</Description>
          <NavLink to={`./`}>
            <Button>{t('Homepage')}</Button>
          </NavLink>
        </WrapText>
      </WrapPage>
    </Container>
  );
};

export default NotFoundPage;
