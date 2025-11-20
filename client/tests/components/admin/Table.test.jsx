import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Table from "../../../src/components/admin/shared/Table.jsx";

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Value", accessor: "value" },
];

test("renders rows", () => {
  const data = [
    { name: "A", value: 1 },
    { name: "B", value: 2 },
  ];
  render(<Table columns={columns} data={data} />);
  expect(screen.getByText("A")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
});

test("handles sort on header click", () => {
  const onSort = jest.fn();
  render(
    <Table
      columns={columns}
      data={[]}
      onSort={onSort}
      sortConfig={{ key: "name", direction: "asc" }}
    />
  );
  fireEvent.click(screen.getByText("Name"));
  expect(onSort).toHaveBeenCalledWith("name");
});

test("shows pagination summary", () => {
  const pagination = { page: 1, total: 30, limit: 10 };
  const onPageChange = jest.fn();
  render(
    <Table
      columns={columns}
      data={[{ name: "A", value: 1 }]}
      pagination={pagination}
      onPageChange={onPageChange}
    />
  );
  expect(screen.getByText("Showing 1 to 10 of 30 results")).toBeInTheDocument();
});

test("shows empty state when no data", () => {
  render(
    <Table columns={columns} data={[]} isLoading={false} emptyMessage="Empty" />
  );
  expect(screen.getByText("Empty")).toBeInTheDocument();
});

test("shows loading skeleton", () => {
  render(<Table columns={columns} data={[]} isLoading />);
  expect(document.querySelector("tbody")).toBeTruthy();
});
