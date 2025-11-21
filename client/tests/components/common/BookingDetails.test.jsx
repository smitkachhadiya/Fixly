import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BookingDetails from '../../../src/components/common/BookingDetails.jsx';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'abc123' }),
  useNavigate: () => jest.fn()
}));

jest.mock('../../../src/config/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        data: {
          _id: 'abc123',
          customerId: { firstName: 'Jane', lastName: 'Smith', phone: '123' },
          serviceListingId: { serviceTitle: 'Plumbing' },
          serviceDateTime: new Date().toISOString(),
          bookingStatus: 'Pending',
          serviceLocation: '123 Street'
        }
      }
    }),
    put: jest.fn().mockResolvedValue({})
  }
}));

describe('BookingDetails', () => {
  test('renders booking information after load', async () => {
    render(<BookingDetails />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Booking Details')).toBeInTheDocument();
      expect(screen.getByText(/Plumbing/)).toBeInTheDocument();
      expect(screen.getByText(/Booking #abc123/)).toBeInTheDocument();
    });
  });

  test('updates status via buttons', async () => {
    const api = (await import('../../../src/config/api')).default;
    render(<BookingDetails />);
    await waitFor(() => screen.getByText('Accept'));
    fireEvent.click(screen.getByText('Accept'));
    expect(api.put).toHaveBeenCalledWith('/api/bookings/abc123/status', { status: 'Confirmed' });
  });
});

