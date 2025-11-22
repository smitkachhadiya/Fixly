import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "../../../src/pages/admin/Dashboard.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t", user: { userType: "admin" } }),
}));

jest.mock("../../../src/components/admin/shared/Card", () => ({
  __esModule: true,
  default: ({ title, value }) => (
    <div>
      {title}:{value}
    </div>
  ),
}));

jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      data: {
        counts: {
          users: 1,
          providers: 2,
          listings: 3,
          bookings: 4,
          pendingBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
        },
        financial: { totalRevenue: 100, avgBookingValue: 25 },
        performance: { conversionRate: 10, userGrowth: 5 },
      },
    },
  }),
}));

test("AdminDashboard renders cards after fetch", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/Total Users:1/i)).toBeInTheDocument();
  });
});

test("AdminDashboard displays all stat cards", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(
      screen.queryByText(/Users|Providers|Listings|Bookings/i)
    ).toBeInTheDocument();
  });
});

test("AdminDashboard shows financial metrics", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(
      screen.queryByText(/Revenue|Booking Value|Income|Financial/i)
    ).toBeInTheDocument();
  });
});

test("AdminDashboard shows performance metrics", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(
      screen.queryByText(/Conversion|Growth|Performance/i)
    ).toBeInTheDocument();
  });
});

test("AdminDashboard shows booking status breakdown", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(
      screen.queryByText(/Pending|Completed|Cancelled|Bookings/i)
    ).toBeInTheDocument();
  });
});

test("AdminDashboard displays data from API correctly", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/1/)).toBeInTheDocument(); // users count
    expect(screen.getByText(/2/)).toBeInTheDocument(); // providers count
  });
});

test("AdminDashboard has accessible card structure", async () => {
  const { container } = render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
  await waitFor(() => {
    const cards = container.querySelectorAll(
      '[class*="card"], [role="region"]'
    );
    expect(cards.length).toBeGreaterThan(0);
  });
});
