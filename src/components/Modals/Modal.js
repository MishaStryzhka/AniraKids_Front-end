// ========
// onCloseModal for close Modal
//
// prohibitClosingByBackdrop
// ========
import { useCallback, useEffect } from 'react';
import {
  Backdrop,
  CloseButton,
  ModalContainer,
  ScrollBox,
  StyledIconCross,
} from './Modal.styled';
import { createPortal } from 'react-dom';

const Modal = ({
  children,
  onCloseModal,
  prohibitClosingByBackdrop = false,
}) => {
  const handleKeyDown = useCallback(
    evt => {
      document.body.style.overflow = 'auto';
      if (evt.code === 'Escape') {
        onCloseModal();
      }
    },
    [onCloseModal]
  );

  document.body.style.overflow = 'hidden';

  const handleBackdropClick = evt => {
    if (evt.currentTarget === evt.target) {
      document.body.style.overflow = 'auto';
      onCloseModal();
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
      onClick={
        onCloseModal && !prohibitClosingByBackdrop
          ? handleBackdropClick
          : () => {}
      }
    >
      <ScrollBox
        onClick={
          onCloseModal && !prohibitClosingByBackdrop
            ? handleBackdropClick
            : () => {}
        }
      >
        <ModalContainer>
          {onCloseModal && (
            <CloseButton
              onClick={() => {
                document.body.style.overflow = 'auto';
                onCloseModal();
              }}
            >
              <StyledIconCross />
            </CloseButton>
          )}
          {children}
        </ModalContainer>
      </ScrollBox>
    </Backdrop>,
    document.querySelector('#modal')
  );
};
export default Modal;
