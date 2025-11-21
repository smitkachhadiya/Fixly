import { ROUTES } from '../../src/constants/routes.js';

test('ROUTES contain expected paths', () => {
  expect(ROUTES.HOME).toBe('/');
  expect(ROUTES.LOGIN).toBe('/login');
  expect(ROUTES.SIGNUP).toBe('/signup');
  expect(ROUTES.SERVICE_DETAILS).toMatch(/\/listing\/:id/);
  expect(ROUTES.ADMIN_DASHBOARD).toBe('/admin');
  expect(ROUTES.PROVIDER_DASHBOARD).toBe('/provider/dashboard');
});

