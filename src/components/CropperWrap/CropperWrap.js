import { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import {
  PreviewBox, PreviewButtonWraper, CropHint, CropError, ZoomControl, CropButton,
} from './CropperWrap.styled';
import { getCroppedImg } from 'helpers';

const CropperWrap = ({ image, onSave, onClose, onSavingChange }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);

  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setError('');
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const onCropComplete = useCallback((_, pixels) => setCroppedArea(pixels), []);

  const handleSave = async () => {
    if (saving.current || !imageUrl || !croppedArea) return;
    saving.current = true;
    setIsLoading(true);
    onSavingChange(true);
    setError('');
    try {
      const canvas = await getCroppedImg(imageUrl, croppedArea);
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(result => {
          if (result) resolve(result);
          else reject(new Error('Image encoding failed'));
        }, 'image/jpeg', 0.92);
      });
      if (blob.size > 5 * 1024 * 1024) throw new Error('Image too large');
      await onSave(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
      onClose();
    } catch (failure) {
      setError('Fotografii se nepodařilo uložit. Zkuste to prosím znovu.');
    } finally {
      saving.current = false;
      setIsLoading(false);
      onSavingChange(false);
    }
  };

  return (
    <div aria-busy={isLoading}>
      <CropHint id="avatar-crop-hint">Posunutím fotografie upravte výřez. Velikost změňte posuvníkem.</CropHint>
      <PreviewBox aria-label="Náhled profilové fotografie" $busy={isLoading}>
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            objectFit="cover"
            onCropChange={isLoading ? () => {} : setCrop}
            onCropAreaChange={onCropComplete}
            onZoomChange={isLoading ? () => {} : setZoom}
            zoomSpeed={0.1}
            mediaProps={{ alt: 'Fotografie k oříznutí', onError: () => {
              setCroppedArea(null);
              setError('Fotografii nelze načíst. Vyberte prosím jiný obrázek.');
            } }}
          />
        )}
      </PreviewBox>
      <ZoomControl>
        <span>Přiblížení</span>
        <input type="range" min="1" max="3" step="0.01" value={zoom}
          aria-describedby="avatar-crop-hint" disabled={isLoading || !croppedArea}
          onChange={event => setZoom(Number(event.target.value))} />
      </ZoomControl>
      {error && <CropError role="alert">{error}</CropError>}
      <PreviewButtonWraper>
        <CropButton type="button" $secondary disabled={isLoading} onClick={onClose}>Zrušit</CropButton>
        <CropButton type="button" disabled={isLoading || !croppedArea} onClick={handleSave}>
          {isLoading ? 'Ukládání…' : 'Uložit'}
        </CropButton>
      </PreviewButtonWraper>
    </div>
  );
};

export default CropperWrap;
