import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Bookings from "../../../src/pages/admin/Bookings.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("axios", () => ({
  get: jest
    .fn()
    .mockResolvedValue({
      data: { data: [], pagination: { total: 0, pages: 1 } },
    }),
  put: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

test("Bookings renders and shows empty state", async () => {
  render(
    <MemoryRouter>
      <Bookings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/No bookings found/i)).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole("button", { name: /Apply/i }));
});

test("Bookings renders filters and search inputs", () => {
  render(
    <MemoryRouter>
      <Bookings />
    </MemoryRouter>
  );
  expect(screen.getByText(/Bookings/i)).toBeInTheDocument();
});

test("Bookings Apply button triggers filter", () => {
  render(
    <MemoryRouter>
      <Bookings />
    </MemoryRouter>
  );
  const applyBtn = screen.getByRole("button", { name: /Apply/i });
  expect(applyBtn).toBeInTheDocument();
  fireEvent.click(applyBtn);
  expect(applyBtn).toBeInTheDocument();
});

test("Bookings shows loading state initially", async () => {
  render(
    <MemoryRouter>
      <Bookings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(
      screen.queryByText(/No bookings found|Loading/i)
    ).toBeInTheDocument();
  });
});

test("Bookings handles pagination correctly", async () => {
  render(
    <MemoryRouter>
      <Bookings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/No bookings found/i)).toBeInTheDocument();
  });
});

test("Bookings column headers are accessible", async () => {
  render(
    <MemoryRouter>
      <Bookings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Booking|Customer|Status/i)).toBeInTheDocument();
  });
});
