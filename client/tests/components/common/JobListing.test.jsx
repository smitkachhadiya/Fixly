import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobListing from '../../../src/components/common/joblisting.jsx';

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => [{ city: 'Ahmedabad' }, { city: 'Surat' }]
});

jest.mock('../../../src/config/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: { data: [] } })
  }
}));

describe('JobListing', () => {
  test('renders filters and fetches cities', async () => {
    render(
      <MemoryRouter>
        <JobListing />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Select City')).toBeInTheDocument());
    expect(screen.getByText('Select Category')).toBeInTheDocument();
  });

  test('submits search', async () => {
    const api = (await import('../../../src/config/api')).default;
    render(
      <MemoryRouter>
        <JobListing />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Search'));
    fireEvent.click(screen.getByText('Search'));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/jobs', expect.any(Object));
    });
  });
});

