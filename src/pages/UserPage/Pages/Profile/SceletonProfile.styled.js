import styled from 'styled-components';
import Sceleton from 'components/Sceleton/Sceleton';

export const SceletonField = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 90.7vw;
  }
  width: 388px;
  height: 20px;
  @media screen and (min-width: 768px) {
    width: 334px;
  }

  @media screen and (min-width: 1280px) {
    width: 400px;
  }
`;

export const SceletonFieldInput = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 90.7vw;
  }
  width: 388px;
  height: 37px;
  @media screen and (min-width: 768px) {
    width: 334px;
  }

  @media screen and (min-width: 1280px) {
    width: 400px;
  }
`;

export const SceletonAvatar = styled(Sceleton)`
  width: 197px;
  height: 197px;
`;

export const SceletonText = styled(Sceleton)`
  width: 105px;
  height: 20px;
`;

export const SceletonDescription = styled(Sceleton)`
  width: 197px;
  height: 20px;
`;
