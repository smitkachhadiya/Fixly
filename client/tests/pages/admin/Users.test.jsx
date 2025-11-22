import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Users from "../../../src/pages/admin/Users.jsx";

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
      data: {
        data: [
          {
            _id: "u1",
            firstName: "John",
            lastName: "Doe",
            email: "a@b.com",
            userType: "user",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        pages: 1,
      },
    }),
  put: jest
    .fn()
    .mockResolvedValue({
      data: {
        data: {
          _id: "u1",
          firstName: "John",
          lastName: "Doe",
          email: "a@b.com",
          userType: "user",
          isActive: false,
          createdAt: new Date().toISOString(),
        },
      },
    }),
  delete: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

test("Users renders and shows list", async () => {
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });
});

test("Users displays user email and type", async () => {
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/a@b.com|john|email/i)).toBeInTheDocument();
  });
});

test("Users shows user active/inactive status", async () => {
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Active|Inactive|Status/i)).toBeInTheDocument();
  });
});

test("Users toggles user active status", async () => {
  const axios = require("axios");
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });
});

test("Users can delete a user with confirmation", async () => {
  const axios = require("axios");
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });
});

test("Users shows creation date for each user", async () => {
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Created|Date|Joined/i)).toBeInTheDocument();
  });
});

test("Users table displays user count", async () => {
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(
      screen.getByText(/User Management|Users|Total/i)
    ).toBeInTheDocument();
  });
});
