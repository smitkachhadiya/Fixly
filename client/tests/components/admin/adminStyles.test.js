import {
  colors,
  layoutStyles,
  cardStyles,
  buttonStyles,
  tableStyles as adminTableStyles,
  formStyles,
  badgeStyles,
  modalStyles,
  statsCardStyles,
  paginationStyles,
  filterStyles,
  breadcrumbStyles,
  alertStyles,
  emptyStateStyles,
  loadingStyles,
} from "../../../src/components/admin/shared/adminStyles.js";

test("adminStyles exports expected keys", () => {
  expect(colors.primary).toBe("indigo-600");
  expect(layoutStyles.container).toContain("min-h-screen");
  expect(cardStyles.title).toContain("font-semibold");
  expect(buttonStyles.primary).toContain("bg-indigo");
  expect(adminTableStyles.table).toContain("divide-y");
  expect(formStyles.input).toContain("rounded-md");
  expect(badgeStyles.active).toContain("bg-green");
  expect(modalStyles.panel).toContain("rounded-lg");
  expect(statsCardStyles.value).toContain("text-3xl");
  expect(paginationStyles.button).toContain("inline-flex");
  expect(filterStyles.container).toContain("rounded-lg");
  expect(breadcrumbStyles.container).toContain("flex");
  expect(alertStyles.base).toContain("rounded-md");
  expect(emptyStateStyles.container).toContain("text-center");
  expect(loadingStyles.spinner).toContain("animate-spin");
});
