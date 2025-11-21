import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ReviewCard from "../../src/components/common/review.jsx";

jest.mock("../../../src/config/api", () => ({
  __esModule: true,
  default: {
    get: jest
      .fn()
      .mockResolvedValue({
        data: {
          success: true,
          data: [
            {
              customerId: { firstName: "A", lastName: "B" },
              reviewText: "Nice",
              rating: 4,
            },
          ],
        },
      }),
  },
}));

describe("ReviewCard", () => {
  test("renders fetched reviews", async () => {
    render(<ReviewCard />);
    await waitFor(() => {
      expect(screen.getByText(/Nice/)).toBeInTheDocument();
    });
  });
});
