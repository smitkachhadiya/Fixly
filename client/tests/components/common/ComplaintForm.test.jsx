import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ComplaintForm from '../../src/components/common/ComplaintForm.jsx';

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ token: 't' })
}));

jest.mock('../../src/config/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { data: { bookingStatus: 'Completed', serviceListingId: { serviceTitle: 'Svc' }, serviceProviderId: { userId: { firstName: 'A', lastName: 'B' } }, serviceDateTime: new Date().toISOString() } } }),
    post: jest.fn().mockResolvedValue({ data: { success: true } })
  }
}));

jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ bookingId: 'b1' })
}));

describe('ComplaintForm', () => {
  test('shows validation error when empty', async () => {
    render(
      <MemoryRouter>
        <ComplaintForm />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Submit a Complaint'));
    fireEvent.click(screen.getByRole('button', { name: /Submit Complaint/i }));
    expect(screen.getByText(/Please provide details/)).toBeInTheDocument();
  });

  test('submits complaint', async () => {
    render(
      <MemoryRouter>
        <ComplaintForm />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Submit a Complaint'));
    fireEvent.change(screen.getByPlaceholderText(/Please provide details/i), { target: { value: 'Issue' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit Complaint/i }));
    const api = (await import('../../src/config/api')).default;
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/complaints', { bookingId: 'b1', complaintType: 'Service Quality', complaintText: 'Issue' });
    });
  });
});
