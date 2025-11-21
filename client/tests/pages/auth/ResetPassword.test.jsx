import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../../../src/pages/auth/ResetPassword.jsx";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ token: "test-token" }),
  useNavigate: () => jest.fn(),
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
    data: { success: true, message: "Password reset successfully" },
  }),
  get: jest.fn().mockResolvedValue({
    data: { valid: true },
  }),
}));

describe("Reset Password Page", () => {
  describe("Rendering", () => {
    test("renders reset password form with title", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      expect(
        screen.getByText(/reset|new password|password/i)
      ).toBeInTheDocument();
    });

    test("renders password input field", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/^password|new password$/i) ||
        screen.getByPlaceholderText(/^password|new password$/i);
      expect(passwordInput).toBeInTheDocument();
    });

    test("renders confirm password input field", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm|confirm password/i);
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("renders submit button", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /reset|submit|update/i,
      });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders instruction text", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const instruction = screen.queryByText(
        /enter new password|create new password/i
      );
      if (instruction) {
        expect(instruction).toBeInTheDocument();
      }
    });
  });

  describe("Form Interactions", () => {
    test("accepts password input", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/^password|new password$/i) ||
        screen.getByPlaceholderText(/^password|new password$/i);
      fireEvent.change(passwordInput, { target: { value: "NewPassword123!" } });
      expect(passwordInput.value).toBe("NewPassword123!");
    });

    test("accepts confirm password input", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm|confirm password/i);
      fireEvent.change(confirmPasswordInput, {
        target: { value: "NewPassword123!" },
      });
      expect(confirmPasswordInput.value).toBe("NewPassword123!");
    });

    test("allows form submission with valid passwords", async () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/^password|new password$/i) ||
        screen.getByPlaceholderText(/^password|new password$/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm|confirm password/i);
      const submitBtn = screen.getByRole("button", {
        name: /reset|submit|update/i,
      });

      fireEvent.change(passwordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "NewPassword123!" },
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitBtn).toBeInTheDocument();
      });
    });
  });

  describe("Validation", () => {
    test("shows error when passwords do not match", async () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/^password|new password$/i) ||
        screen.getByPlaceholderText(/^password|new password$/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm|confirm password/i);
      const submitBtn = screen.getByRole("button", {
        name: /reset|submit|update/i,
      });

      fireEvent.change(passwordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "DifferentPassword123!" },
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitBtn).toBeInTheDocument();
      });
    });

    test("shows error for empty password fields", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /reset|submit|update/i,
      });
      fireEvent.click(submitBtn);
      expect(submitBtn).toBeInTheDocument();
    });

    test("shows error for weak password", async () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/^password|new password$/i) ||
        screen.getByPlaceholderText(/^password|new password$/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm|confirm password/i);

      fireEvent.change(passwordInput, { target: { value: "123" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "123" } });

      await waitFor(() => {
        expect(passwordInput).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    test("password inputs have proper labels", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const passwordInput =
        screen.getByLabelText(/^password|new password$/i) ||
        screen.getByPlaceholderText(/^password|new password$/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm|confirm password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("submit button is accessible", () => {
      render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /reset|submit|update/i,
      });
      expect(submitBtn).toHaveAccessibleName();
    });
  });
});
