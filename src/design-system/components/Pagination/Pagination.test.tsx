import { fireEvent, render, screen } from '@testing-library/react';
import { getPaginationItems, Pagination } from './Pagination';

const labels = {
  previous: 'Předchozí',
  next: 'Další',
  navigation: 'Stránkování produktů',
  goToPage: (page: number) => `Přejít na stránku ${page}`,
  currentPage: (page: number) => `Stránka ${page}, aktuální`,
};

test('uses the frozen deterministic numbered pagination patterns', () => {
  expect(getPaginationItems(1, 12)).toEqual([1, 2, 3, 'ellipsis-right', 12]);
  expect(getPaginationItems(5, 12)).toEqual([1, 'ellipsis-left', 4, 5, 6, 'ellipsis-right', 12]);
  expect(getPaginationItems(12, 12)).toEqual([1, 'ellipsis-left', 10, 11, 12]);
  expect(getPaginationItems(2, 4)).toEqual([1, 2, 3, 4]);
});

test('marks the current page and calls the consumer page-change handler', () => {
  const onPageChange = jest.fn();
  render(
    <Pagination
      page={5}
      pages={12}
      onPageChange={onPageChange}
      labels={labels}
    />
  );

  expect(screen.getByRole('navigation', { name: 'Stránkování produktů' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Stránka 5, aktuální' })).toHaveAttribute('aria-current', 'page');

  fireEvent.click(screen.getByRole('button', { name: 'Přejít na stránku 6' }));
  expect(onPageChange).toHaveBeenCalledWith(6);

  fireEvent.click(screen.getByRole('button', { name: 'Předchozí' }));
  expect(onPageChange).toHaveBeenCalledWith(4);
});
