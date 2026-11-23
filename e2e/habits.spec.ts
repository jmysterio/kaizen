import { expect, test } from '@playwright/test'

test('create, complete minimum, upgrade to target, persists on reload, archive', async ({ page }) => {
  await page.goto('./#/habits')
  await page.getByRole('button', { name: 'New' }).click()
  await page.getByLabel('Name').fill('Guitar')
  await page.getByLabel('Minimum').fill('5 min')
  await page.getByLabel('Target', { exact: true }).fill('20 min')
  await page.getByRole('button', { name: 'Save' }).click()

  await page.getByRole('button', { name: 'Mark Guitar done' }).click()
  await expect(page.getByRole('button', { name: 'Undo Guitar' })).toBeVisible()
  await expect(page.getByText('1 day streak')).toBeVisible()
  await page.getByRole('button', { name: 'Did 20 min' }).click()
  await expect(page.getByText('Target', { exact: true })).toBeVisible()

  await page.reload()
  await expect(page.getByText('Target', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Undo Guitar' }).click()
  await expect(page.getByRole('button', { name: 'Mark Guitar done' })).toBeVisible()

  await page.getByRole('button', { name: 'Edit Guitar' }).click()
  await page.getByRole('button', { name: 'Archive' }).click()
  await expect(page.getByRole('button', { name: 'Mark Guitar done' })).toHaveCount(0)
  await page.getByText('Archived (1)').click()
  await page.getByRole('button', { name: 'Restore' }).click()
  await expect(page.getByRole('button', { name: 'Mark Guitar done' })).toBeVisible()
})
