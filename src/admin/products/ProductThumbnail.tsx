import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import type { AdminProductPhoto } from '../api/products';

const Frame = styled.span`
  inline-size: 64px;
  block-size: 80px;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[2]};
  display: grid;
  place-items: center;
  background: ${t.color.bg.subtle};
  color: ${t.color.text.muted};

  @media (min-width: ${t.breakpoint.md}) {
    inline-size: 72px;
    block-size: 90px;
  }

  @media (min-width: ${t.breakpoint.lg}) {
    inline-size: 48px;
    block-size: 64px;
  }

  & > svg {
    inline-size: ${t.icon.size.md};
    block-size: ${t.icon.size.md};
    stroke-width: ${t.icon.strokeWidth};
  }
`;

const Image = styled.img`
  inline-size: 100%;
  block-size: 100%;
  display: block;
  object-fit: cover;
`;

export function ProductThumbnail({ photo }: { photo?: AdminProductPhoto }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photo?.url]);

  if (!photo?.url || failed) {
    return (
      <Frame data-product-thumbnail data-thumbnail-fallback aria-hidden="true">
        <ImageOff />
      </Frame>
    );
  }

  return (
    <Frame data-product-thumbnail>
      <Image
        src={photo.url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </Frame>
  );
}
