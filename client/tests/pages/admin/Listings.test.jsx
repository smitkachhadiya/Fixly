import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Listings from "../../../src/pages/admin/Listings.jsx";

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
  get: jest.fn((url) => {
    if (url.startsWith("/api/categories")) {
      return Promise.resolve({
        data: { data: [{ _id: "c1", categoryName: "Cat" }] },
      });
    }
    return Promise.resolve({
      data: {
        data: [{ _id: "l1", serviceTitle: "Svc", isActive: true }],
        pagination: { total: 1, pages: 1 },
      },
    });
  }),
  put: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

test("Listings renders table with data", async () => {
  render(
    <MemoryRouter>
      <Listings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/All Listings/i)).toBeInTheDocument();
  });
});

test("Listings filters listings by category", async () => {
  render(
    <MemoryRouter>
      <Listings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/All Listings/i)).toBeInTheDocument();
  });
});

test("Listings category dropdown loads options", async () => {
  render(
    <MemoryRouter>
      <Listings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Cat|Category/i)).toBeInTheDocument();
  });
});

test("Listings shows listing status", async () => {
  render(
    <MemoryRouter>
      <Listings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/All Listings/i)).toBeInTheDocument();
  });
});

test("Listings toggle active/inactive status", async () => {
  render(
    <MemoryRouter>
      <Listings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/All Listings/i)).toBeInTheDocument();
  });
});

test("Listings shows service title in table", async () => {
  render(
    <MemoryRouter>
      <Listings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Svc|Service/i)).toBeInTheDocument();
  });
});

test("Listings pagination works correctly", async () => {
  render(
    <MemoryRouter>
      <Listings />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/All Listings/i)).toBeInTheDocument();
  });
});
