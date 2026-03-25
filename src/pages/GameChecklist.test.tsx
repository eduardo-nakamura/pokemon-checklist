import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameChecklist } from './GameChecklist';

const queryClient = new QueryClient();

describe('GameChecklist Smoke Test', () => {
  it('deve renderizar sem quebrar', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/checklist/kalos-central']}>
          <GameChecklist />
        </MemoryRouter>
      </QueryClientProvider>
    );
    // Verifica se pelo menos o estado inicial ou loading aparece
    expect(screen.queryByText(/loading/i) || screen.queryByRole('heading')).toBeTruthy();
  });
});