import { Search, X } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IconButton } from '../../../design-system/components/IconButton';
import { Input } from '../../../design-system/components/Input';
import { Spinner } from '../../../design-system/components/Spinner';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { productPath } from '../../../navigation/routes';

export interface SearchProductSuggestion {
  slug: string;
  name: string;
  image: { src: string; alt: string };
  meta: string;
}
export type SearchStatus = 'idle' | 'loading' | 'results' | 'empty' | 'error';

export interface SearchContentProps {
  query: string;
  status: SearchStatus;
  suggestions: readonly SearchProductSuggestion[];
  inputRef: RefObject<HTMLInputElement>;
  leadingAction?: ReactNode;
  trailingAction?: ReactNode;
  onQueryChange(value: string): void;
  onSubmit(): void;
}

const Form = styled.form`min-inline-size: 0;`;
const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${t.space[2]};
  min-inline-size: 0;
`;
const SearchField = styled(Input)`flex: 1 1 auto; min-inline-size: 0;`;
const Results = styled.div`
  padding-block-start: ${t.space[6]};
  min-inline-size: 0;
`;
const Status = styled.div`
  min-block-size: ${t.control.height.compact};
  display: flex;
  align-items: center;
  gap: ${t.space[2]};
  color: ${t.color.text.secondary};
  font-family: ${t.font.family.ui};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
`;
const SuggestionList = styled.ul`list-style:none;margin:0;padding:0;`;
const SuggestionLink = styled(Link)`
  min-block-size: 96px;
  display: flex;
  align-items: center;
  gap: ${t.space[4]};
  padding-block: ${t.space[2]};
  border-block-end: 1px solid ${t.color.border.subtle};
  color: ${t.color.text.primary};
  text-decoration: none;
  &:focus-visible { outline: ${t.focus.ring.width} solid ${t.color.focus.ring}; outline-offset: ${t.focus.ring.offset}; }
`;
const Thumb = styled.img`
  inline-size: 64px;
  block-size: 80px;
  flex: 0 0 auto;
  object-fit: cover;
  border-radius: ${t.radius[2]};
`;
const ProductName = styled.span`
  display:block;
  font-family:${t.font.family.ui};
  font-size:${t.type.label.size};
  line-height:${t.type.label.lineHeight};
  font-weight:${t.type.label.weight};
  letter-spacing:${t.type.label.letterSpacing};
`;
const Meta = styled.span`
  display:block;
  margin-block-start:${t.space[1]};
  color:${t.color.text.secondary};
  font-family:${t.font.family.ui};
  font-size:${t.type.bodySm.size};
  line-height:${t.type.bodySm.lineHeight};
`;

export function SearchContent({ query, status, suggestions, inputRef, leadingAction, trailingAction, onQueryChange, onSubmit }: SearchContentProps) {
  const clearAction = query ? (
    <IconButton aria-label="Vymazat hledání" icon={<X aria-hidden="true" />} variant="ghost" onClick={() => onQueryChange('')} />
  ) : undefined;

  return (
    <Form onSubmit={event => { event.preventDefault(); onSubmit(); }} role="search">
      <TopRow data-search-top-row>
        {leadingAction}
        <SearchField
          ref={inputRef}
          label="Hledat"
          hideLabel
          type="search"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Hledat"
          leadingIcon={<Search aria-hidden="true" />}
          trailingAction={clearAction}
        />
        {trailingAction}
      </TopRow>

      <Results aria-live="polite">
        {status === 'loading' ? <Status><Spinner size="sm" /> Načítání…</Status> : null}
        {status === 'empty' ? <Status>Žádné výsledky.</Status> : null}
        {status === 'error' ? <Status>Výsledky se nepodařilo načíst.</Status> : null}
        {status === 'results' && suggestions.length > 0 ? (
          <SuggestionList>
            {suggestions.map(item => (
              <li key={item.slug}>
                <SuggestionLink to={productPath(item.slug)}>
                  <Thumb src={item.image.src} alt={item.image.alt} width={64} height={80} />
                  <span><ProductName>{item.name}</ProductName><Meta>{item.meta}</Meta></span>
                </SuggestionLink>
              </li>
            ))}
          </SuggestionList>
        ) : null}
      </Results>
    </Form>
  );
}
