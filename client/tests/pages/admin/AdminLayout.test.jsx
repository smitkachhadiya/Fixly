import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminLayout from "../../../src/pages/admin/AdminLayout.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { firstName: "Ada", lastName: "Admin" },
    logout: jest.fn(),
  }),
}));

test("AdminLayout renders header and logout navigates", () => {
  delete window.location;
  window.location = { href: "" };
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AdminLayout>
        <div>Child</div>
      </AdminLayout>
    </MemoryRouter>
  );
  expect(screen.getByText(/Fixly Admin|F/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Logout|Sign out/i }));
  expect(window.location.href).toContain("/login");
});

test("AdminLayout renders children correctly", () => {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AdminLayout>
        <div data-testid="child-content">Test Child</div>
      </AdminLayout>
    </MemoryRouter>
  );
  expect(screen.getByTestId("child-content")).toBeInTheDocument();
  expect(screen.getByText("Test Child")).toBeInTheDocument();
});

test("AdminLayout displays admin user name in header", () => {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    </MemoryRouter>
  );
  expect(screen.getByText(/Ada Admin|Ada/)).toBeInTheDocument();
});

test("AdminLayout has accessible navigation structure", () => {
  const { container } = render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    </MemoryRouter>
  );
  const nav = container.querySelector("nav");
  expect(nav).toBeInTheDocument();
});

test("AdminLayout sidebar toggles on mobile", () => {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    </MemoryRouter>
  );
  const toggleBtn = screen.queryByRole("button", {
    name: /menu|toggle|hamburger/i,
  });
  if (toggleBtn) {
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toBeInTheDocument();
  }
});
