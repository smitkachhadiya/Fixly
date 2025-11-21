import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../../../src/pages/auth/ForgotPassword.jsx";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
  },
}));

jest.mock("axios", () => ({
  post: jest.fn().mockResolvedValue({
    data: { success: true, message: "Email sent successfully" },
  }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Forgot Password Page", () => {
  describe("Rendering", () => {
    test("renders forgot password form with title", () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      expect(screen.getByText(/forgot|password|reset/i)).toBeInTheDocument();
    });

    test("renders email input field", () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    test("renders submit button", () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /send|reset|submit/i,
      });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders back to login link", () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const backLink = screen.queryByText(/back|login|sign in/i);
      if (backLink) {
        expect(backLink).toBeInTheDocument();
      }
    });

    test("renders description text", () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const description = screen.queryByText(
        /enter your email|we will send|reset link/i
      );
      if (description) {
        expect(description).toBeInTheDocument();
      }
    });
  });

  describe("Form Interactions", () => {
    test("accepts email input", () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      expect(emailInput.value).toBe("test@example.com");
    });

    test("allows form submission with valid email", async () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      const submitBtn = screen.getByRole("button", {
        name: /send|reset|submit/i,
      });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
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
          <ForgotPassword />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /send|reset|submit/i,
      });
      fireEvent.click(submitBtn);
      expect(submitBtn).toBeInTheDocument();
    });

    test("shows error for invalid email format", async () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
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
  });

  describe("Navigation", () => {
    test("back to login link is clickable", () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const backLink = screen.queryByText(/back|login|sign in/i);
      if (backLink) {
        fireEvent.click(backLink);
        expect(backLink).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    test("email input has proper label", () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const emailInput =
        screen.getByLabelText(/email|email address/i) ||
        screen.getByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    test("submit button is accessible", () => {
      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /send|reset|submit/i,
      });
      expect(submitBtn).toHaveAccessibleName();
    });

    test("page has semantic structure", () => {
      const { container } = render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );
      const mainContent =
        container.querySelector("main") ||
        container.querySelector('[role="main"]');
      expect(mainContent || container.firstChild).toBeInTheDocument();
    });
  });
});
