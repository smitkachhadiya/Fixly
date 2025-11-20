import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Breadcrumbs from "../../../src/components/admin/shared/Breadcrumbs.jsx";

test("renders breadcrumbs from location", () => {
  render(
    <MemoryRouter initialEntries={["/admin/providers/listings"]}>
      <Breadcrumbs />
    </MemoryRouter>
  );
  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Providers")).toBeInTheDocument();
  expect(screen.getByText("Listings")).toBeInTheDocument();
});

test("renders custom items when provided", () => {
  const items = [
    { label: "Home", path: "/", icon: "home" },
    { label: "Page", path: "/page", icon: "circle" },
  ];
  render(
    <MemoryRouter>
      <Breadcrumbs items={items} />
    </MemoryRouter>
  );
  expect(screen.getByText("Home")).toBeInTheDocument();
  expect(screen.getByText("Page")).toBeInTheDocument();
});
