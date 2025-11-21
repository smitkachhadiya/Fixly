import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext.jsx';

jest.mock('../../src/config/api.js', () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn().mockResolvedValue({ data: { data: { id: 'u1', userType: 'user', isActive: true } } }),
    clearUserCache: jest.fn()
  }
}));

function Consumer() {
  const { user, token, login, logout, isAuthenticated, isAdmin } = useAuth();
  return (
    <div>
      <div>auth:{isAuthenticated() ? 'yes' : 'no'}</div>
      <div>admin:{isAdmin() ? 'yes' : 'no'}</div>
      <button onClick={() => login({ id: 'u', userType: 'admin', isActive: true }, 't')}>doLogin</button>
      <button onClick={() => logout()}>doLogout</button>
      <div>user:{user ? (user.userType || '') : ''}</div>
      <div>token:{token || ''}</div>
    </div>
  );
}

test('AuthProvider initializes and login/logout behave', async () => {
  await act(async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
  });
  expect(screen.getByText(/auth:no/)).toBeInTheDocument();
  await act(async () => {
    screen.getByText('doLogin').click();
  });
  expect(screen.getByText(/admin:yes/)).toBeInTheDocument();
  await act(async () => {
    screen.getByText('doLogout').click();
  });
  expect(window.location.href).toContain('/login');
});

