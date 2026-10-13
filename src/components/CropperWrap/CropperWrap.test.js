import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CropperWrap from './CropperWrap';
import { getCroppedImg } from 'helpers';

jest.mock('helpers', () => ({ getCroppedImg: jest.fn() }));
jest.mock('react-easy-crop', () => {
  const { useEffect } = require('react');
  return function Cropper({ onCropAreaChange, mediaProps }) {
    useEffect(() => { onCropAreaChange({}, { x: 0, y: 0, width: 100, height: 100 }); }, [onCropAreaChange]);
    return <img alt={mediaProps.alt} onError={mediaProps.onError} />;
  };
});

const image = new File(['source'], 'source.jpg', { type: 'image/jpeg' });
let onSave, onClose, onSavingChange, encode;
beforeEach(() => {
  encode = undefined;
  onSave = jest.fn(); onClose = jest.fn(); onSavingChange = jest.fn();
  URL.createObjectURL = jest.fn(() => 'blob:fixture');
  URL.revokeObjectURL = jest.fn();
  getCroppedImg.mockReset().mockResolvedValue({ toBlob: callback => { encode = callback; } });
});
const view = () => render(<CropperWrap image={image} onSave={onSave} onClose={onClose} onSavingChange={onSavingChange} />);

test('waits for encoding and upload, prevents duplicate saves, then closes', async () => {
  let uploaded;
  onSave.mockImplementation(() => new Promise(resolve => { uploaded = resolve; }));
  const { unmount } = view();
  fireEvent.click(screen.getByRole('button', { name: 'Uložit' }));
  await waitFor(() => expect(encode).toEqual(expect.any(Function)));
  expect(onSave).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Zrušit' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Ukládání…' }));
  await act(async () => encode(new Blob(['jpeg'], { type: 'image/jpeg' })));
  expect(onSave).toHaveBeenCalledTimes(1);
  expect(onSave.mock.calls[0][0]).toMatchObject({ name: 'avatar.jpg', type: 'image/jpeg' });
  expect(onClose).not.toHaveBeenCalled();
  await act(async () => uploaded());
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onSavingChange.mock.calls).toEqual([[true], [false]]);
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fixture');
});

test.each(['encode', 'upload'])('%s failure keeps the editor open and allows retry', async failure => {
  onSave.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({});
  view();
  fireEvent.click(screen.getByRole('button', { name: 'Uložit' }));
  await waitFor(() => expect(encode).toEqual(expect.any(Function)));
  await act(async () => encode(failure === 'encode' ? null : new Blob(['jpeg'])));
  expect(await screen.findByRole('alert')).toHaveTextContent('Fotografii se nepodařilo uložit.');
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Uložit' })).toBeEnabled();
  onSave.mockReset().mockResolvedValue({});
  fireEvent.click(screen.getByRole('button', { name: 'Uložit' }));
  await act(async () => {});
  await act(async () => encode(new Blob(['jpeg'])));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('unreadable image cannot be saved; cancelling releases its object URL', async () => {
  const { unmount } = view();
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByRole('alert')).toHaveTextContent('Fotografii nelze načíst.');
  expect(screen.getByRole('button', { name: 'Uložit' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Zrušit' }));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onSave).not.toHaveBeenCalled();
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fixture');
});
