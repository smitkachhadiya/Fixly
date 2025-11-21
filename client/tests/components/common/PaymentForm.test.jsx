import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentForm from '../../src/components/common/PaymentForm.jsx';

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ token: 't' })
}));

jest.mock('../../src/config/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { data: { bookingStatus: 'Pending', serviceListingId: { serviceTitle: 'Svc' }, serviceProviderId: { userId: { firstName: 'A', lastName: 'B' } }, serviceDateTime: new Date().toISOString(), totalAmount: 100 } } }),
    post: jest.fn().mockResolvedValue({ data: { success: true } })
  }
}));

jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ bookingId: 'b1' })
}));

describe('PaymentForm', () => {
  test('processes credit card payment', async () => {
    render(
      <MemoryRouter>
        <PaymentForm />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('Payment Details'));
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: 'Credit Card' } });
    fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText(/Cardholder Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Expiry Date/i), { target: { value: '12/30' } });
    fireEvent.change(screen.getByLabelText(/CVV/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));
    const api = (await import('../../src/config/api')).default;
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/payments', expect.objectContaining({ bookingId: 'b1', paymentMethod: 'Credit Card' }));
    });
  });
});
