import { Form } from 'formik';
import styled from 'styled-components';

export const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
`;

export const WrapInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
