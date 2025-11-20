import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "../../../src/components/admin/shared/Modal.jsx";

test("renders modal when open and closes on overlay click", () => {
  const onClose = jest.fn();
  render(
    <Modal isOpen title="Title" onClose={onClose}>
      <div>Content</div>
    </Modal>
  );
  expect(screen.getByText("Title")).toBeInTheDocument();
  const overlay = document.querySelector(".fixed.inset-0");
  fireEvent.click(overlay);
  expect(onClose).toHaveBeenCalled();
});

test("closes on Escape key", () => {
  const onClose = jest.fn();
  render(
    <Modal isOpen title="Esc" onClose={onClose}>
      <div />
    </Modal>
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onClose).toHaveBeenCalled();
});
