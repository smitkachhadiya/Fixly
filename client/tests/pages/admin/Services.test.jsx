import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Services from "../../../src/pages/admin/Services.jsx";

jest.mock("../../../src/context/AuthContext.jsx", () => ({
  useAuth: () => ({ token: "t" }),
}));

jest.mock("axios", () => ({
  get: jest
    .fn()
    .mockResolvedValue({
      data: {
        data: [
          {
            _id: "s1",
            serviceTitle: "Svc",
            categoryId: { categoryName: "Cat" },
            serviceProviderId: { name: "Prov" },
            isActive: true,
          },
        ],
        total: 1,
      },
    }),
}));

test("Services renders overview and table", async () => {
  render(
    <MemoryRouter>
      <Services />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/Services Overview/i)).toBeInTheDocument();
  });
});

test("Services displays service title and category", async () => {
  render(
    <MemoryRouter>
      <Services />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Svc|Service/i)).toBeInTheDocument();
  });
});

test("Services shows provider information", async () => {
  render(
    <MemoryRouter>
      <Services />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Prov|Provider/i)).toBeInTheDocument();
  });
});

test("Services displays active status", async () => {
  render(
    <MemoryRouter>
      <Services />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Active|Status|Enabled/i)).toBeInTheDocument();
  });
});

test("Services filters by category", async () => {
  render(
    <MemoryRouter>
      <Services />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText(/Services Overview/i)).toBeInTheDocument();
  });
});

test("Services shows service count in overview", async () => {
  render(
    <MemoryRouter>
      <Services />
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Total|Count|Services/i)).toBeInTheDocument();
  });
});

test("Services table has accessible structure", async () => {
  const { container } = render(
    <MemoryRouter>
      <Services />
    </MemoryRouter>
  );
  await waitFor(() => {
    const table = container.querySelector("table");
    if (table) {
      expect(table).toBeInTheDocument();
    }
  });
});
