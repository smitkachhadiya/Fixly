import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../src/components/common/Navbar.jsx';

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { userType: 'admin' }, logout: jest.fn(), isAuthenticated: () => true })
}));

describe('Navbar', () => {
  test('renders brand and links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('Fixly')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  test('toggles mobile menu', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
