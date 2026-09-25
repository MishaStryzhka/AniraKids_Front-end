import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { SelectField } from '../../design-system/components/SelectField';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import type { ProductListUrlState } from './productListSearchParams';
import { countActiveProductFilters } from './productListSearchParams';

const Root = styled.section`
  min-inline-size: 0;
`;

const MobileDisclosure = styled(Button)`
  inline-size: 100%;
  justify-content: space-between;

  @media (min-width: ${t.breakpoint.md}) {
    display: none;
  }
`;

const Body = styled.div<{ $expanded: boolean }>`
  display: ${({ $expanded }) => ($expanded ? 'block' : 'none')};
  margin-block-start: ${t.space[3]};

  @media (min-width: ${t.breakpoint.md}) {
    display: block;
    margin-block-start: 0;
  }

  @media (min-width: ${t.breakpoint.lg}) {
    display: flex;
    align-items: end;
    gap: ${t.space[3]};
  }
`;

const Fields = styled.div`
  min-inline-size: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${t.space[3]};

  @media (min-width: ${t.breakpoint.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${t.breakpoint.lg}) {
    flex: 1 1 auto;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const ResetWrap = styled.div`
  margin-block-start: ${t.space[3]};
  display: flex;
  justify-content: flex-end;

  @media (min-width: ${t.breakpoint.lg}) {
    flex: 0 0 auto;
    margin-block-start: 0;
  }
`;

export interface AdminProductsFiltersProps {
  state: ProductListUrlState;
  expanded: boolean;
  onToggle(): void;
  onChange(patch: Partial<ProductListUrlState>): void;
  onClear(): void;
}

export function AdminProductsFilters({
  state,
  expanded,
  onToggle,
  onChange,
  onClear,
}: AdminProductsFiltersProps) {
  const activeCount = countActiveProductFilters(state);

  return (
    <Root aria-label="Filtry produktů">
      <MobileDisclosure
        variant="secondary"
        size="compact"
        aria-expanded={expanded}
        aria-controls="admin-products-filter-controls"
        onClick={onToggle}
      >
        {activeCount > 0 ? `Filtry (${activeCount})` : 'Filtry'}
      </MobileDisclosure>

      <Body id="admin-products-filter-controls" $expanded={expanded}>
        <Fields>
          <SelectField
            label="Status"
            value={state.status ?? ''}
            onChange={event =>
              onChange({ status: (event.target.value || undefined) as ProductListUrlState['status'] })
            }
          >
            <option value="">Vše</option>
            <option value="draft">Koncept</option>
            <option value="active">Aktivní</option>
            <option value="archived">Archivované</option>
          </SelectField>

          <SelectField
            label="Kategorie"
            value={state.category ?? ''}
            onChange={event =>
              onChange({ category: (event.target.value || undefined) as ProductListUrlState['category'] })
            }
          >
            <option value="">Vše</option>
            <option value="dress">Šaty</option>
            <option value="suit">Obleky</option>
            <option value="set">Sety</option>
            <option value="accessory">Doplňky</option>
            <option value="other">Ostatní</option>
          </SelectField>

          <SelectField
            label="Určení"
            value={state.gender ?? ''}
            onChange={event =>
              onChange({ gender: (event.target.value || undefined) as ProductListUrlState['gender'] })
            }
          >
            <option value="">Vše</option>
            <option value="girls">Dívky</option>
            <option value="boys">Chlapci</option>
            <option value="women">Ženy</option>
            <option value="men">Muži</option>
            <option value="unisex">Unisex</option>
          </SelectField>

          <SelectField
            label="Pronájem"
            value={state.rentalEnabled === undefined ? '' : String(state.rentalEnabled)}
            onChange={event => {
              const value = event.target.value;
              onChange({
                rentalEnabled:
                  value === '' ? undefined : value === 'true',
              });
            }}
          >
            <option value="">Vše</option>
            <option value="true">Ano</option>
            <option value="false">Ne</option>
          </SelectField>
        </Fields>

        {activeCount > 0 ? (
          <ResetWrap>
            <Button variant="ghost" size="compact" onClick={onClear}>
              Zrušit filtry
            </Button>
          </ResetWrap>
        ) : null}
      </Body>
    </Root>
  );
}
