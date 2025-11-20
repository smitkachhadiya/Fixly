import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Button from "../../../src/components/admin/shared/Button.jsx";

test("renders button with variant and icon", () => {
  const onClick = jest.fn();
  render(
    <Button variant="success" icon="check" onClick={onClick}>
      Save
    </Button>
  );
  const btn = screen.getByRole("button", { name: /save/i });
  expect(btn.className).toMatch(/admin-btn/);
  expect(btn.className).toMatch(/admin-btn-success/);
  fireEvent.click(btn);
  expect(onClick).toHaveBeenCalled();
});

test("renders link button", () => {
  render(
    <MemoryRouter>
      <Button to="/foo">Go</Button>
    </MemoryRouter>
  );
  const link = screen.getByText("Go").closest("a");
  expect(link).toHaveAttribute("href", "/foo");
});

test("shows spinner when loading", () => {
  render(<Button isLoading>Load</Button>);
  const btn = screen.getByRole("button");
  expect(btn).toBeDisabled();
  expect(btn.querySelector("svg")).toBeTruthy();
});
