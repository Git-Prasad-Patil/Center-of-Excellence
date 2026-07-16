import { test, expect } from "../utils/fixtures";

// Exercises NotificationBarComponent (pages/components/notification-bar.component.ts)
// against the newsletter subscribe box, verified live on
// https://demowebshop.tricentis.com/: the result notification is hidden/empty
// until the subscribe AJAX call resolves, then becomes visible with a
// confirmation message. The component only reports state (getMessage,
// isVisible); the assertions on that state live here, in the test.
test("Newsletter signup shows a confirmation notification", async ({ homePage }) => {
  expect(await homePage.notificationBar.isVisible()).toBe(false);

  const email = `test.${Date.now()}@example.com`;
  await homePage.notificationBar.subscribe(email);

  expect(await homePage.notificationBar.isVisible()).toBe(true);
  expect(await homePage.notificationBar.getMessage()).toContain("Thank you for signing up");
});
