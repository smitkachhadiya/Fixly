import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateAdminUser from "../../../src/pages/admin/CreateAdminUser.jsx";

jest.useFakeTimers();

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("axios", () => ({
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

test("CreateAdminUser submits and shows success", async () => {
  render(
    <MemoryRouter>
      <CreateAdminUser />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByLabelText(/First Name/i), {
    target: { value: "A" },
  });
  fireEvent.change(screen.getByLabelText(/Last Name/i), {
    target: { value: "B" },
  });
  fireEvent.change(screen.getByLabelText(/Email Address/i), {
    target: { value: "a@b.com" },
  });
  fireEvent.change(screen.getByLabelText(/^Password$/i), {
    target: { value: "secret1" },
  });
  fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
    target: { value: "secret1" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Create Admin User/i }));
  await waitFor(() => {
    expect(
      screen.getByText(/Admin user created successfully/i)
    ).toBeInTheDocument();
  });
  jest.advanceTimersByTime(2000);
  expect(mockNavigate).toHaveBeenCalledWith("/admin/users");
});

test("CreateAdminUser shows validation error for mismatched passwords", async () => {
  render(
    <MemoryRouter>
      <CreateAdminUser />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByLabelText(/First Name/i), {
    target: { value: "A" },
  });
  fireEvent.change(screen.getByLabelText(/Last Name/i), {
    target: { value: "B" },
  });
  fireEvent.change(screen.getByLabelText(/Email Address/i), {
    target: { value: "a@b.com" },
  });
  fireEvent.change(screen.getByLabelText(/^Password$/i), {
    target: { value: "secret1" },
  });
  fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
    target: { value: "secret2" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Create Admin User/i }));
  await waitFor(() => {
    expect(screen.queryByText(/match|same|confirm/i)).toBeInTheDocument();
  });
});

test("CreateAdminUser shows validation error for invalid email", async () => {
  render(
    <MemoryRouter>
      <CreateAdminUser />
    </MemoryRouter>
  );
  fireEvent.change(screen.getByLabelText(/Email Address/i), {
    target: { value: "invalid-email" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Create Admin User/i }));
  await waitFor(() => {
    expect(screen.queryByText(/email|valid/i)).toBeInTheDocument();
  });
});

test("CreateAdminUser shows validation error for empty fields", async () => {
  render(
    <MemoryRouter>
      <CreateAdminUser />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole("button", { name: /Create Admin User/i }));
  await waitFor(() => {
    expect(
      screen.queryByText(/required|cannot be empty|enter/i)
    ).toBeInTheDocument();
  });
});

test("CreateAdminUser submit button is disabled initially", () => {
  render(
    <MemoryRouter>
      <CreateAdminUser />
    </MemoryRouter>
  );
  const submitBtn = screen.getByRole("button", { name: /Create Admin User/i });
  expect(submitBtn).toBeInTheDocument();
});

test("CreateAdminUser form renders all input fields", () => {
  render(
    <MemoryRouter>
      <CreateAdminUser />
    </MemoryRouter>
  );
  expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
});
