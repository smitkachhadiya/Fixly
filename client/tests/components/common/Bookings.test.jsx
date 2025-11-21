import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Bookings from "../../src/components/common/Bookings.jsx";

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ token: "t", user: { id: "u" } }),
}));

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { data: [] } }),
    put: jest.fn().mockResolvedValue({}),
  },
}));

describe("Bookings", () => {
  test("shows tabs and empty state", async () => {
    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );
    expect(screen.getByText("My Bookings")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("Past")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/No upcoming bookings/)).toBeInTheDocument();
    });
  });

  test("renders bookings and handles cancel", async () => {
    const api = (await import("../../src/config/api.js")).default;
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            _id: "b1",
            serviceListingId: { serviceTitle: "Cleaning" },
            serviceProviderId: {
              userId: { firstName: "Pat", lastName: "Doe" },
            },
            bookingStatus: "Pending",
            serviceDateTime: new Date(Date.now() + 86400000).toISOString(),
            serviceLocation: "Loc",
            totalAmount: 10,
          },
        ],
      },
    });
    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("Cleaning"));
    const cancelBtn = screen.getByText("Cancel Booking");
    window.confirm = jest.fn(() => true);
    fireEvent.click(cancelBtn);
    expect(api.put).toHaveBeenCalledWith("/api/bookings/b1/cancel");
  });
});
