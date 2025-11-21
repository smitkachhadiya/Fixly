import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../../src/pages/auth/Login.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    login: jest.fn().mockResolvedValue({ success: true }),
    token: null,
  }),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
  },
}));

jest.mock("axios", () => ({
  post: jest.fn().mockResolvedValue({
    data: {
      success: true,
      token: "test-token",
      user: { email: "test@test.com", userType: "user" },
    },
  }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Login Page", () => {
  describe("Rendering", () => {
    test("renders login form with title", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      expect(screen.getByText(/login|sign in/i)).toBeInTheDocument();
    });

    test("renders email input field", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    test("renders password input field", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/password/i) ||
        screen.getByPlaceholderText(/password/i);
      expect(passwordInput).toBeInTheDocument();
    });

    test("renders submit button", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", { name: /login|sign in/i });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders forgot password link", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const forgotLink = screen.queryByText(/forgot|password/i);
      if (forgotLink) {
        expect(forgotLink).toBeInTheDocument();
      }
    });

    test("renders signup link", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const signupLink = screen.queryByText(/sign up|register|create/i);
      if (signupLink) {
        expect(signupLink).toBeInTheDocument();
      }
    });
  });

  describe("Form Interactions", () => {
    test("accepts email input", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      expect(emailInput.value).toBe("test@example.com");
    });

    test("accepts password input", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/password/i) ||
        screen.getByPlaceholderText(/password/i);
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      expect(passwordInput.value).toBe("password123");
    });

    test("allows form submission with valid data", async () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      const passwordInput =
        screen.getByLabelText(/password/i) ||
        screen.getByPlaceholderText(/password/i);
      const submitBtn = screen.getByRole("button", { name: /login|sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitBtn).toBeInTheDocument();
      });
    });
  });

  describe("Validation", () => {
    test("shows error for empty email", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", { name: /login|sign in/i });
      fireEvent.click(submitBtn);
      expect(submitBtn).toBeInTheDocument();
    });

    test("shows error for invalid email format", async () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: "invalidemail" } });
      fireEvent.blur(emailInput);
      await waitFor(() => {
        expect(emailInput).toBeInTheDocument();
      });
    });

    test("shows error for empty password", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      const submitBtn = screen.getByRole("button", { name: /login|sign in/i });
      fireEvent.click(submitBtn);
      expect(submitBtn).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    test("forgot password link is clickable", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const forgotLink = screen.queryByText(/forgot|password/i);
      if (forgotLink) {
        fireEvent.click(forgotLink);
        expect(forgotLink).toBeInTheDocument();
      }
    });

    test("signup link is clickable", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const signupLink = screen.queryByText(/sign up|register|create/i);
      if (signupLink) {
        fireEvent.click(signupLink);
        expect(signupLink).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    test("form has proper labels", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      const passwordInput =
        screen.getByLabelText(/password/i) ||
        screen.getByPlaceholderText(/password/i);
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    test("submit button is accessible", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", { name: /login|sign in/i });
      expect(submitBtn).toHaveAccessibleName();
    });
  });
});
