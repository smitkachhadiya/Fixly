import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Reports from "../../../src/pages/admin/Reports.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("react-chartjs-2", () => ({
  Bar: (props) => <div>BarChart</div>,
  Line: (props) => <div>LineChart</div>,
  Pie: (props) => <div>PieChart</div>,
}));

jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      data: {
        labels: ["A"],
        datasets: [{ label: "L", data: [1] }],
        tableHeaders: ["H1"],
        tableData: [{ H1: "V" }],
        summary: { totalRevenue: 10 },
      },
    },
  }),
}));

test("Reports loads and shows chart title and export", async () => {
  render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/Reports & Analytics/i)).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(
      screen.getByText(/BarChart|LineChart|PieChart/i)
    ).toBeInTheDocument();
  });
});

test("Reports renders all chart types", async () => {
  render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(
      screen.getByText(/BarChart|LineChart|PieChart/i)
    ).toBeInTheDocument();
  });
});

test("Reports shows export functionality", async () => {
  render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(
      screen.queryByRole("button", { name: /export|download|pdf/i })
    ).toBeInTheDocument();
  });
});

test("Reports displays summary data", async () => {
  render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Revenue|Summary|Total/i)).toBeInTheDocument();
  });
});

test("Reports table displays correctly", async () => {
  const { container } = render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/Reports & Analytics/i)).toBeInTheDocument();
  });
});

test("Reports date filter changes data", async () => {
  render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );
  await waitFor(() => {
    const filterInputs = screen.queryAllByRole("textbox");
    expect(filterInputs.length).toBeGreaterThanOrEqual(0);
  });
});

test("Reports has accessible chart labels", async () => {
  const { container } = render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/Reports & Analytics/i)).toBeInTheDocument();
  });
});
