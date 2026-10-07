import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { createRef } from 'react';
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  getAvailabilityBlocks,
} from '../api/availabilityBlocks';
import {
  createAdminVariant,
  getAdminProductVariants,
  getAdminProductInventorySnapshot,
} from '../api/products';
import { AdminApiError } from '../api/errors';
import { ProductInventoryItems } from '../products/ProductInventoryItems';
import { useProductInventoryController } from '../products/useProductInventoryController';
import {
  ProductVariantsSection,
  type ProductVariantsSectionHandle,
} from '../products/ProductVariantsSection';
import { blockFixture as block } from './blockFixtures';
jest.mock('../api/client', () => ({
  adminApiClient: {},
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
jest.mock('../api/availabilityBlocks', () => ({
  ...jest.requireActual('../api/availabilityBlocks'),
  createAvailabilityBlock: jest.fn(),
  deleteAvailabilityBlock: jest.fn(),
  getAvailabilityBlocks: jest.fn(),
}));
jest.mock('../api/products', () => ({
  ...jest.requireActual('../api/products'),
  createAdminVariant: jest.fn(),
  getAdminProductVariants: jest.fn(),
  getAdminProductInventorySnapshot: jest.fn(),
}));
jest.mock('../calendar/calendarDates', () => ({
  ...jest.requireActual('../calendar/calendarDates'),
  pragueToday: () => '2026-10-07',
}));
const get = getAvailabilityBlocks as jest.MockedFunction<
    typeof getAvailabilityBlocks
  >,
  create = createAvailabilityBlock as jest.MockedFunction<
    typeof createAvailabilityBlock
  >,
  remove = deleteAvailabilityBlock as jest.MockedFunction<
    typeof deleteAvailabilityBlock
  >;
const access = jest.fn(() => false),
  variant = {
    id: 'v1',
    productId: 'p1',
    size: '98',
    status: 'active' as const,
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
    inventory: [
      {
        id: 'i1',
        variantId: 'v1',
        internalCode: 'AK-001',
        status: 'active' as const,
        condition: 'good' as const,
        notes: '',
      },
      {
        id: 'i2',
        variantId: 'v1',
        internalCode: 'AK-002',
        status: 'maintenance' as const,
        condition: 'good' as const,
        notes: '',
      },
    ],
  };
function Harness() {
  const controller = useProductInventoryController({
    productId: 'p1',
    token: 'token',
    initialVariants: [variant],
    onAccessError: access,
  });
  return (
    <>
      <output data-testid="risk">
        {JSON.stringify(controller.getActivationGuardSnapshot())}
      </output>
      <button onClick={() => void controller.refresh()}>
        Refresh inventory
      </button>
      <ProductInventoryItems
        variant={variant}
        controller={controller}
        blocks={{ token: 'token', onAccessError: access }}
        onRequestOpen={jest.fn()}
        onRequestRetire={jest.fn()}
      />
    </>
  );
}
const panel = () => screen.getByRole('region', { name: 'Ruční blokování' });
async function open() {
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Ruční blokování' })[0]
  );
  await screen.findByText('Naplánovaná blokování');
}
beforeEach(() => {
  jest.clearAllMocks();
  get.mockResolvedValue([]);
  create.mockResolvedValue(block);
  remove.mockResolvedValue(undefined);
});
test('panel GET is lazy; empty, form validation, create and cancel focus preserve related identity', async () => {
  render(<Harness />);
  expect(get).not.toHaveBeenCalled();
  await open();
  expect(panel()).toHaveTextContent('Fyzický kus: AK-001');
  expect(screen.getByText('Žádná ruční blokování')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Přidat blokování' }));
  fireEvent.click(screen.getByRole('button', { name: 'Uložit blokování' }));
  await waitFor(() => expect(screen.getByLabelText('Začátek')).toHaveFocus());
  expect(create).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Zrušit', exact: true }));
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Přidat blokování' })
    ).toHaveFocus()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Přidat blokování' }));
  fireEvent.change(screen.getByLabelText('Začátek'), {
    target: { value: '2026-10-10' },
  });
  fireEvent.change(screen.getByLabelText('Konec'), {
    target: { value: '2026-10-11' },
  });
  get.mockResolvedValueOnce([block]);
  fireEvent.click(screen.getByRole('button', { name: 'Uložit blokování' }));
  await screen.findByText('Blokování bylo vytvořeno.');
  expect(
    screen.getByText('10. října 2026 – 11. října 2026')
  ).toBeInTheDocument();
  expect(screen.queryByText('internal-admin-id')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Začátek')).not.toBeInTheDocument();
});
test('delete confirms exact item/date with safe focus and removes only after list refresh; inactive can delete', async () => {
  get.mockResolvedValueOnce([{ ...block, inventoryItemId: 'i2' }]);
  render(<Harness />);
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Ruční blokování' })[1]
  );
  await screen.findByText('Naplánovaná blokování');
  expect(
    screen.getByRole('button', { name: 'Přidat blokování' })
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole('button', { name: 'Odstranit', exact: true })
  );
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveTextContent('AK-002');
  expect(dialog).toHaveTextContent('10. října 2026 – 11. října 2026');
  expect(within(dialog).getByRole('button', { name: 'Zpět' })).toHaveFocus();
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Odstranit blokování' })
  );
  await screen.findByText('Blokování bylo odstraněno.');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('Žádná ruční blokování')).toBeInTheDocument();
});
test('collapsed unknown preserves parent activation and same-item guards; inventory refresh cannot drop the row', async () => {
  render(<Harness />);
  await open();
  fireEvent.click(screen.getByRole('button', { name: 'Přidat blokování' }));
  fireEvent.change(screen.getByLabelText('Začátek'), {
    target: { value: '2026-10-10' },
  });
  fireEvent.change(screen.getByLabelText('Konec'), {
    target: { value: '2026-10-11' },
  });
  create.mockRejectedValueOnce(new Error('offline'));
  fireEvent.click(screen.getByRole('button', { name: 'Uložit blokování' }));
  await screen.findByText('Výsledek vytvoření blokování není potvrzený');
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Ruční blokování' })[0]
  );
  expect(screen.getByTestId('risk')).toHaveTextContent(
    '"unresolvedOutcome":true'
  );
  expect(
    screen.getAllByRole('button', { name: 'Upravit', exact: true })[0]
  ).toBeDisabled();
  expect(
    screen.getAllByRole('button', { name: 'Upravit', exact: true })[1]
  ).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh inventory' }));
  expect(getAdminProductInventorySnapshot).not.toHaveBeenCalled();
  expect(screen.getByText('AK-001')).toBeInTheDocument();
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Ruční blokování' })[0]
  );
  expect(get).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Načíst blokování' }));
  await screen.findByText('Aktuální blokování byla načtena.');
  expect(screen.getByLabelText('Začátek')).toHaveValue('2026-10-10');
  expect(create).toHaveBeenCalledTimes(1);
});
test('older variant refresh cannot unmount a newly dirty block panel and unlock activation', async () => {
  const ref = createRef<ProductVariantsSectionHandle>();
  render(
    <ProductVariantsSection
      ref={ref}
      productId="p1"
      token="token"
      initialVariants={[variant]}
      onAccessError={access}
    />
  );
  (createAdminVariant as jest.Mock).mockRejectedValueOnce(
    new AdminApiError({ kind: 'network', code: 'NETWORK', message: 'private' })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Přidat variantu' }));
  fireEvent.change(screen.getByLabelText('Velikost'), {
    target: { value: '110' },
  });
  fireEvent.click(
    screen.getAllByRole('button', { name: 'Přidat variantu', exact: true })[1]
  );
  await screen.findByText('Výsledek vytvoření varianty není potvrzený');
  let resolve!: (value: []) => void;
  (getAdminProductVariants as jest.Mock).mockReturnValueOnce(
    new Promise<[]>(yes => {
      resolve = yes;
    })
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Načíst aktuální varianty' })
  );
  await open();
  fireEvent.click(screen.getByRole('button', { name: 'Přidat blokování' }));
  fireEvent.change(screen.getByLabelText('Začátek'), {
    target: { value: '2026-10-10' },
  });
  await act(async () => resolve([]));
  expect(screen.getByLabelText('Začátek')).toHaveValue('2026-10-10');
  expect(ref.current?.getActivationGuardSnapshot().hasUnsavedWork).toBe(true);
});
