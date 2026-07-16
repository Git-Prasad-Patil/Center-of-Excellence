import {test, expect} from '@playwright/test';

test('missing element handling - test that fails', async ({page}) => {
  await page.goto('https://example.com');   
  
  // This will fail because the element doesn't exist
  const element = await page.$('#nonExistentElement'); 
  expect(element).not.toBeNull(); // This assertion will fail
});