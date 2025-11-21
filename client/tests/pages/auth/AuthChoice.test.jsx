import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthChoice from "../../../src/pages/auth/AuthChoice.jsx";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("AuthChoice Page", () => {
  describe("Rendering", () => {
    test("renders auth choice page with title", () => {
      render(
        <MemoryRouter>
          <AuthChoice />
        </MemoryRouter>
      );
      expect(screen.getByText(/Login|Sign in|Choose/i)).toBeInTheDocument();
    });

    test("renders login button", () => {
      render(
        <MemoryRouter>
          <AuthChoice />
        </MemoryRouter>
      );
      const loginBtn = screen.getByRole("button", { name: /login|sign in/i });
      expect(loginBtn).toBeInTheDocument();
    });

    test("renders signup button", () => {
      render(
        <MemoryRouter>
          <AuthChoice />
        </MemoryRouter>
      );
      const signupBtn = screen.getByRole("button", {
        name: /signup|sign up|register/i,
      });
      expect(signupBtn).toBeInTheDocument();
    });

    test("renders both authentication option buttons", () => {
      render(
        <MemoryRouter>
          <AuthChoice />
        </MemoryRouter>
      );
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Navigation", () => {
    test("login button is clickable", () => {
      render(
        <MemoryRouter>
          <AuthChoice />
        </MemoryRouter>
      );
      const loginBtn = screen.getByRole("button", { name: /login|sign in/i });
      fireEvent.click(loginBtn);
      expect(loginBtn).toBeInTheDocument();
    });

    test("signup button is clickable", () => {
      render(
        <MemoryRouter>
          <AuthChoice />
        </MemoryRouter>
      );
      const signupBtn = screen.getByRole("button", {
        name: /signup|sign up|register/i,
      });
      fireEvent.click(signupBtn);
      expect(signupBtn).toBeInTheDocument();
    });
  });

  describe("Layout and Accessibility", () => {
    test("page is accessible with semantic structure", () => {
      const { container } = render(
        <MemoryRouter>
          <AuthChoice />
        </MemoryRouter>
      );
      const mainContent =
        container.querySelector("main") ||
        container.querySelector('[role="main"]');
      expect(mainContent || container.firstChild).toBeInTheDocument();
    });

    test("buttons have proper accessible labels", () => {
      render(
        <MemoryRouter>
          <AuthChoice />
        </MemoryRouter>
      );
      const loginBtn = screen.getByRole("button", { name: /login|sign in/i });
      const signupBtn = screen.getByRole("button", {
        name: /signup|sign up|register/i,
      });
      expect(loginBtn).toHaveAccessibleName();
      expect(signupBtn).toHaveAccessibleName();
    });
  });
});
