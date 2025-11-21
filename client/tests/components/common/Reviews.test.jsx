import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Reviews from "../../src/components/common/Reviews.jsx";

jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ providerId: "p1" }),
}));

jest.mock("../../../src/context/AuthContext", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest
      .fn()
      .mockResolvedValue({
        data: {
          data: [
            {
              _id: "r1",
              rating: 4,
              reviewText: "Good",
              customerId: { firstName: "User", lastName: "One" },
              reviewDateTime: new Date().toISOString(),
              bookingId: { serviceListingId: { serviceTitle: "Cleaning" } },
            },
          ],
        },
      }),
  },
}));

describe("Reviews", () => {
  test("renders list", async () => {
    render(
      <MemoryRouter>
        <Reviews />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
      expect(screen.getByText("Good")).toBeInTheDocument();
    });
  });
});
