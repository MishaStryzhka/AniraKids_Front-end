import Sceleton from 'components/Sceleton/Sceleton';
import { useState } from 'react';

const ImageLoader = ({ src, alt, className, ...props }) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <Sceleton className={className} {...props} />}
      <img
        src={src}
        alt={alt}
        {...props}
        className={className}
        onLoad={() => setLoading(false)}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </>
  );
};

export default ImageLoader;
