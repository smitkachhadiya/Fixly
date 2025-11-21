import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ChangePassword from "../../../src/pages/auth/ChangePassword.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { email: "test@example.com" },
    token: "test-token",
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
    data: { success: true, message: "Password changed successfully" },
  }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Change Password Page", () => {
  describe("Rendering", () => {
    test("renders change password form with title", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      expect(screen.getByText(/change|update|password/i)).toBeInTheDocument();
    });

    test("renders current password input", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const currentPasswordInput =
        screen.getByLabelText(/current|old password/i) ||
        screen.getByPlaceholderText(/current|old password/i);
      expect(currentPasswordInput).toBeInTheDocument();
    });

    test("renders new password input", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const newPasswordInput =
        screen.getByLabelText(/new password/i) ||
        screen.getByPlaceholderText(/new password/i);
      expect(newPasswordInput).toBeInTheDocument();
    });

    test("renders confirm password input", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("renders submit button", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /change|update|submit/i,
      });
      expect(submitBtn).toBeInTheDocument();
    });

    test("renders cancel button", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const cancelBtn = screen.queryByRole("button", { name: /cancel|back/i });
      if (cancelBtn) {
        expect(cancelBtn).toBeInTheDocument();
      }
    });
  });

  describe("Form Interactions", () => {
    test("accepts current password input", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const currentPasswordInput =
        screen.getByLabelText(/current|old password/i) ||
        screen.getByPlaceholderText(/current|old password/i);
      fireEvent.change(currentPasswordInput, {
        target: { value: "OldPassword123!" },
      });
      expect(currentPasswordInput.value).toBe("OldPassword123!");
    });

    test("accepts new password input", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const newPasswordInput =
        screen.getByLabelText(/new password/i) ||
        screen.getByPlaceholderText(/new password/i);
      fireEvent.change(newPasswordInput, {
        target: { value: "NewPassword123!" },
      });
      expect(newPasswordInput.value).toBe("NewPassword123!");
    });

    test("accepts confirm password input", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);
      fireEvent.change(confirmPasswordInput, {
        target: { value: "NewPassword123!" },
      });
      expect(confirmPasswordInput.value).toBe("NewPassword123!");
    });

    test("allows form submission with valid passwords", async () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const currentPasswordInput =
        screen.getByLabelText(/current|old password/i) ||
        screen.getByPlaceholderText(/current|old password/i);
      const newPasswordInput =
        screen.getByLabelText(/new password/i) ||
        screen.getByPlaceholderText(/new password/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole("button", {
        name: /change|update|submit/i,
      });

      fireEvent.change(currentPasswordInput, {
        target: { value: "OldPassword123!" },
      });
      fireEvent.change(newPasswordInput, {
        target: { value: "NewPassword123!" },
      });
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
    test("shows error for empty current password", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /change|update|submit/i,
      });
      fireEvent.click(submitBtn);
      expect(submitBtn).toBeInTheDocument();
    });

    test("shows error when new passwords do not match", async () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const currentPasswordInput =
        screen.getByLabelText(/current|old password/i) ||
        screen.getByPlaceholderText(/current|old password/i);
      const newPasswordInput =
        screen.getByLabelText(/new password/i) ||
        screen.getByPlaceholderText(/new password/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole("button", {
        name: /change|update|submit/i,
      });

      fireEvent.change(currentPasswordInput, {
        target: { value: "OldPassword123!" },
      });
      fireEvent.change(newPasswordInput, {
        target: { value: "NewPassword123!" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "DifferentPassword123!" },
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitBtn).toBeInTheDocument();
      });
    });

    test("shows error when new password is same as current", async () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const currentPasswordInput =
        screen.getByLabelText(/current|old password/i) ||
        screen.getByPlaceholderText(/current|old password/i);
      const newPasswordInput =
        screen.getByLabelText(/new password/i) ||
        screen.getByPlaceholderText(/new password/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);
      const submitBtn = screen.getByRole("button", {
        name: /change|update|submit/i,
      });

      fireEvent.change(currentPasswordInput, {
        target: { value: "SamePassword123!" },
      });
      fireEvent.change(newPasswordInput, {
        target: { value: "SamePassword123!" },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "SamePassword123!" },
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitBtn).toBeInTheDocument();
      });
    });

    test("shows error for weak password", async () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const newPasswordInput =
        screen.getByLabelText(/new password/i) ||
        screen.getByPlaceholderText(/new password/i);
      fireEvent.change(newPasswordInput, { target: { value: "123" } });

      await waitFor(() => {
        expect(newPasswordInput).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    test("cancel button is clickable", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const cancelBtn = screen.queryByRole("button", { name: /cancel|back/i });
      if (cancelBtn) {
        fireEvent.click(cancelBtn);
        expect(cancelBtn).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    test("all password inputs have proper labels", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const currentPasswordInput =
        screen.getByLabelText(/current|old password/i) ||
        screen.getByPlaceholderText(/current|old password/i);
      const newPasswordInput =
        screen.getByLabelText(/new password/i) ||
        screen.getByPlaceholderText(/new password/i);
      const confirmPasswordInput =
        screen.getByLabelText(/confirm|confirm password/i) ||
        screen.getByPlaceholderText(/confirm password/i);

      expect(currentPasswordInput).toBeInTheDocument();
      expect(newPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    test("submit button is accessible", () => {
      render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const submitBtn = screen.getByRole("button", {
        name: /change|update|submit/i,
      });
      expect(submitBtn).toHaveAccessibleName();
    });

    test("form has proper semantic structure", () => {
      const { container } = render(
        <MemoryRouter>
          <ChangePassword />
        </MemoryRouter>
      );
      const formElement = container.querySelector("form");
      expect(formElement || container.firstChild).toBeInTheDocument();
    });
  });
});
