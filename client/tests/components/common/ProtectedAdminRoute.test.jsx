import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedAdminRoute from '../../src/components/common/ProtectedAdminRoute.jsx';

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: () => true, isAdmin: () => true })
}));

describe('ProtectedAdminRoute', () => {
  test('renders children for admin', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<ProtectedAdminRoute><div>Secret</div></ProtectedAdminRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: () => false, isAdmin: () => false })
}));

describe('ProtectedAdminRoute redirect', () => {
  test('redirects to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<ProtectedAdminRoute><div>Secret</div></ProtectedAdminRoute>} />
          <Route path="/login" element={<div>LoginPage</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });
});
