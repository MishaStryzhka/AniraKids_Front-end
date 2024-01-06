import { useAuth } from 'hooks';
import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { PreviewBox, PreviewButtonWraper } from './CropperWrap.styled';
import { getCroppedImg } from 'helpers';
import { ButtonBack } from 'components/Modals/ModalLogOut/ModalLogOut.styled';
import Button from 'components/Button/Button';

const CropperWrap = ({ image, name, setImage, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [avatarWidth, setAvatarWidth] = useState(300);
  const [avatarHeight, setAvatarHeight] = useState(400);
  const [isLoading, setIsLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (image) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(image);
      img.onload = function () {
        setAvatarWidth(img.width);
        setAvatarHeight(img.height);
      };

      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.addEventListener('load', () => {
        setImageBase64(reader.result);
      });
    }
  }, [image]);

  const onCropComplete = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedArea(croppedAreaPixels);
    },
    [setCroppedArea]
  );

  const hendleSave = async () => {
    setIsLoading(true);
    const canvas = await getCroppedImg(URL.createObjectURL(image), croppedArea);

    canvas.toBlob(blob => {
      const file = new File([blob], `${user.userID}-${name}`, {
        type: image.type,
      });

      setImage(file);
    });
    setIsLoading(false);
    onClose();
  };

  if (!imageBase64) {
    return;
  }

  return (
    <>
      <PreviewBox width={avatarWidth} height={avatarHeight}>
        <Cropper
          image={imageBase64}
          crop={crop}
          zoom={zoom}
          aspect={3 / 3}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          zoomSpeed={0.1}
        />
      </PreviewBox>
      <PreviewButtonWraper>
        <ButtonBack
          onClick={() => {
            onClose();
          }}
        >
          Скасувати
        </ButtonBack>
        <Button
          type="button"
          disabled={isLoading}
          onClick={e => {
            hendleSave(e);
          }}
        >
          Зберегти
        </Button>
      </PreviewButtonWraper>
    </>
  );
};

export default CropperWrap;
