import { expect, test } from '@playwright/test'

test('write, reload, edit, search answers, delete', async ({ page }) => {
  await page.goto('./#/journal')
  await page.getByRole('radio', { name: 'Free write' }).click()

  // A half-written draft survives a reload.
  await page.getByLabel('Entry', { exact: true }).fill('Morning pages')
  await page.reload()
  await expect(page.getByLabel('Entry', { exact: true })).toHaveValue('Morning pages')
  await page.getByRole('button', { name: 'Save entry' }).click()
  await expect(page.getByLabel('Entry', { exact: true })).toHaveValue('')

  // Saved entry survives a reload.
  await page.reload()
  await expect(page.getByRole('button', { name: /Edit entry/ })).toContainText('Morning pages')

  // Form entry: answer one question, skip the rest, then find it by the answer.
  await page.getByRole('radio', { name: 'Evening reflection' }).click()
  await page.getByLabel('What am I grateful for?').fill('Quiet coffee')
  await page.getByRole('button', { name: 'Save entry' }).click()
  const saved = page.getByRole('button', { name: /Edit entry/ }).first()
  await expect(saved).toContainText('Evening reflection')
  await expect(saved).toContainText('Quiet coffee')
  await expect(saved).not.toContainText('What did I accomplish today?')
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

test('editing a form changes new entries but not old ones', async ({ page }) => {
  await page.goto('./#/journal')
  await page.getByRole('radio', { name: 'Morning intentions' }).click()
  await page.getByLabel('What one result would make today a success?').fill('Ship the calendar')
  await page.getByRole('button', { name: 'Save entry' }).click()

  await page.goto('./#/settings')
  await page.getByText('Morning intentions').click()
  await page.getByRole('group').filter({ hasText: 'Morning intentions' }).getByLabel('Question 1', { exact: true }).fill('What is my top priority?')

  await page.goto('./#/journal')
  await page.getByRole('radio', { name: 'Morning intentions' }).click()
  await expect(page.getByLabel('What is my top priority?')).toBeVisible()
  await expect(page.getByRole('button', { name: /Edit entry/ })).toContainText('What one result would make today a success?')
})
