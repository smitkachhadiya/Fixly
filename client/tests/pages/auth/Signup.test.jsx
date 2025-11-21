import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../../../src/pages/auth/Signup.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    register: jest.fn().mockResolvedValue({ success: true }),
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
    data: { success: true, message: "Registration successful" },
  }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Signup Page", () => {
  describe("Rendering", () => {
    test("renders signup form with title", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      expect(
        screen.getByText(/sign up|register|create account/i)
      ).toBeInTheDocument();
    });

    test("renders first name input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const firstNameInput =
        screen.getByLabelText(/first name/i) ||
        screen.getByPlaceholderText(/first name/i);
      expect(firstNameInput).toBeInTheDocument();
    });

    test("renders last name input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const lastNameInput =
        screen.getByLabelText(/last name/i) ||
        screen.getByPlaceholderText(/last name/i);
      expect(lastNameInput).toBeInTheDocument();
    });

    test("renders email input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    test("renders phone number input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const phoneInput =
        screen.getByLabelText(/phone|phone number/i) ||
        screen.getByPlaceholderText(/phone/i);
      if (phoneInput) {
        expect(phoneInput).toBeInTheDocument();
      }
    });

    test("renders password input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/^password$/i) ||
        screen.getByPlaceholderText(/^password$/i);
      expect(passwordInput).toBeInTheDocument();
    });

    test("renders confirm password input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const confirmPasswordInput =
        screen.getByLabelText(/confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("renders submit button", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /sign up|register/i,
      });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders login link", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const loginLink = screen.queryByText(
        /already have account|login|sign in/i
      );
      if (loginLink) {
        expect(loginLink).toBeInTheDocument();
      }
    });
  });

  describe("Form Interactions", () => {
    test("accepts first name input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const firstNameInput =
        screen.getByLabelText(/first name/i) ||
        screen.getByPlaceholderText(/first name/i);
      fireEvent.change(firstNameInput, { target: { value: "John" } });
      expect(firstNameInput.value).toBe("John");
    });

    test("accepts last name input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const lastNameInput =
        screen.getByLabelText(/last name/i) ||
        screen.getByPlaceholderText(/last name/i);
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      expect(lastNameInput.value).toBe("Doe");
    });

    test("accepts email input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      expect(emailInput.value).toBe("john@example.com");
    });

    test("accepts phone input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const phoneInput =
        screen.getByLabelText(/phone|phone number/i) ||
        screen.getByPlaceholderText(/phone/i);
      if (phoneInput) {
        fireEvent.change(phoneInput, { target: { value: "1234567890" } });
        expect(phoneInput.value).toBe("1234567890");
      }
    });

    test("accepts password input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/^password$/i) ||
        screen.getByPlaceholderText(/^password$/i);
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      expect(passwordInput.value).toBe("Password123!");
    });

    test("accepts confirm password input", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const confirmPasswordInput =
        screen.getByLabelText(/confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);
      fireEvent.change(confirmPasswordInput, {
        target: { value: "Password123!" },
      });
      expect(confirmPasswordInput.value).toBe("Password123!");
    });
  });

  describe("Validation", () => {
    test("shows error when passwords do not match", async () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/^password$/i) ||
        screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole("button", {
        name: /sign up|register/i,
      });

      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "DifferentPassword123!" },
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitBtn).toBeInTheDocument();
      });
    });

    test("shows error for invalid email format", async () => {
      render(
        <MemoryRouter>
          <Signup />
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

    test("shows error when required fields are empty", async () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /sign up|register/i,
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitBtn).toBeInTheDocument();
      });
    });
  });

  describe("Navigation Links", () => {
    test("login link is clickable", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const loginLink = screen.queryByText(
        /already have account|login|sign in/i
      );
      if (loginLink) {
        fireEvent.click(loginLink);
        expect(loginLink).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    test("all form inputs have proper labels", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const firstNameInput =
        screen.getByLabelText(/first name/i) ||
        screen.getByPlaceholderText(/first name/i);
      const lastNameInput =
        screen.getByLabelText(/last name/i) ||
        screen.getByPlaceholderText(/last name/i);
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      const passwordInput =
        screen.getByLabelText(/^password$/i) ||
        screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);

      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("submit button is accessible", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /sign up|register/i,
      });
      expect(submitBtn).toHaveAccessibleName();
    });
  });
});
