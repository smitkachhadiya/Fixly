import { tableStyles as legacyTableStyles } from "../../../src/components/admin/shared/styles.js";

test("styles tableStyles keys exist", () => {
  expect(legacyTableStyles.table).toContain("divide-y");
  expect(legacyTableStyles.thead).toContain("bg-gray-50");
  expect(legacyTableStyles.td).toContain("text-sm");
});
