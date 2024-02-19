// ========
// onClick for close Modal
//
// prohibitClosingByBackdrop
// ========
import { useCallback, useEffect } from 'react';
import {
  Backdrop,
  ModalContainer,
  ScrollBox,
  StyledIconCross,
} from './Modal.styled';
import { createPortal } from 'react-dom';

const Modal = ({ children, onClick, prohibitClosingByBackdrop = false }) => {
  const handleKeyDown = useCallback(
    evt => {
      document.body.style.overflow = 'auto';
      if (evt.code === 'Escape') {
        onClick();
      }
    },
    [onClick]
  );

  console.log('prohibitClosingByBackdrop', prohibitClosingByBackdrop);

  document.body.style.overflow = 'hidden';

  const handleBackdropClick = evt => {
    if (evt.currentTarget === evt.target) {
      document.body.style.overflow = 'auto';
      onClick();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return createPortal(
    <Backdrop
      onClick={!prohibitClosingByBackdrop ? handleBackdropClick : () => {}}
    >
      <ScrollBox
        onClick={!prohibitClosingByBackdrop ? handleBackdropClick : () => {}}
      >
        <ModalContainer>
          {onClick && (
            <StyledIconCross
              onClick={() => {
                document.body.style.overflow = 'auto';
                onClick();
              }}
            />
          )}
          {children}
        </ModalContainer>
      </ScrollBox>
    </Backdrop>,
    document.querySelector('#modal')
  );
};
export default Modal;
