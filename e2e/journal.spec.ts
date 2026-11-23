import { expect, test } from '@playwright/test'

test('write, reload, edit, search prompts, delete', async ({ page }) => {
  await page.goto('./#/journal')

  // A half-written draft survives a reload.
  await page.getByLabel('Entry', { exact: true }).fill('Morning pages')
  await page.reload()
  await expect(page.getByLabel('Entry', { exact: true })).toHaveValue('Morning pages')
  await page.getByRole('button', { name: 'Save entry' }).click()
  await expect(page.getByLabel('Entry', { exact: true })).toHaveValue('')

  // Saved entry survives a reload.
  await page.reload()
  await expect(page.getByRole('button', { name: /Edit entry/ })).toContainText('Morning pages')

  // Guided entry, then find it by a prompt answer.
  await page.getByRole('button', { name: 'Use prompts' }).click()
  await page.getByLabel('What am I grateful for?').fill('Quiet coffee')
  await page.getByRole('button', { name: 'Save entry' }).click()
  await page.getByLabel('Search entries').fill('coffee')
  await expect(page.getByRole('button', { name: /Edit entry/ })).toHaveCount(1)
  await page.getByLabel('Search entries').fill('')

  // Edit persists.
  await page.getByRole('button', { name: /Edit entry/ }).last().click()
  await page.getByLabel('Entry', { exact: true }).last().fill('Morning pages, edited')
  await page.getByRole('button', { name: 'Done' }).click()
  await page.reload()
  await expect(page.getByText('Morning pages, edited')).toBeVisible()

  // Delete asks first.
  await page.getByRole('button', { name: /Edit entry/ }).last().click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Keep' }).click()
  await expect(page.getByText('Morning pages, edited')).toBeVisible()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('Morning pages, edited')).toHaveCount(0)
})
