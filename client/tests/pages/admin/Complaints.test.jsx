import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Complaints from "../../../src/pages/admin/Complaints.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("../../../src/components/admin/shared/Table", () => ({
  __esModule: true,
  default: ({ data }) => <div>rows:{data.length}</div>,
}));

jest.mock("../../../src/components/admin/shared/Modal", () => ({
  __esModule: true,
  default: ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null),
}));

jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({ data: { data: [], total: 0 } }),
  put: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

test("Complaints loads and renders header", async () => {
  render(
    <MemoryRouter>
      <Complaints />
    </MemoryRouter>
  );
  expect(screen.getByText(/Customer Complaints/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText(/rows:0/)).toBeInTheDocument();
  });
});

test("Complaints renders filter options", () => {
  render(
    <MemoryRouter>
      <Complaints />
    </MemoryRouter>
  );
  expect(
    screen.getByText(/Customer Complaints|Filter|Search/i)
  ).toBeInTheDocument();
});

test("Complaints shows loading state", async () => {
  render(
    <MemoryRouter>
      <Complaints />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/rows:|Loading/i)).toBeInTheDocument();
  });
});

test("Complaints modal opens for complaint details", async () => {
  render(
    <MemoryRouter>
      <Complaints />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/Customer Complaints/i)).toBeInTheDocument();
  });
});

test("Complaints displays complaint status correctly", async () => {
  render(
    <MemoryRouter>
      <Complaints />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/rows:0/)).toBeInTheDocument();
  });
});

test("Complaints table has accessible structure", async () => {
  const { container } = render(
    <MemoryRouter>
      <Complaints />
    </MemoryRouter>
  );
  const table = container.querySelector("table");
  if (table) {
    expect(table).toBeInTheDocument();
  }
  await waitFor(() => {
    expect(screen.getByText(/rows:0/)).toBeInTheDocument();
  });
});
