import { expect, test } from '@playwright/test'
import fixture from '../src/data/__fixtures__/v1.json' with { type: 'json' }

test('shell navigates between tabs', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
  const tabs = page.getByRole('navigation').last()
  await tabs.getByRole('link', { name: 'Journal' }).click()
  await expect(page.getByRole('heading', { name: 'Journal' })).toBeVisible()
  await tabs.getByRole('link', { name: 'More' }).click()
  await page.getByRole('link', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(tabs.getByRole('link', { name: 'More' })).toHaveAttribute('aria-current', 'page')
})

test('works offline after first load', async ({ page, context }) => {
  await page.goto('./')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload() // now controlled by the service worker
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
})

test('restore a backup, then back it up again', async ({ page }) => {
  await page.goto('./#/settings')
  await page.getByTestId('restore-input').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'kaizen', schemaVersion: 1, exportedAt: Date.now(), tables: fixture })),
  })
  await page.getByRole('button', { name: 'Replace' }).click()
  await expect(page.getByRole('status')).toHaveText('Restored from backup.')

  await page.getByText('Diagnostics').click()
  await expect(page.getByTestId('count-journal')).toHaveText('2')
  await expect(page.getByTestId('count-habits')).toHaveText('1')

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Back up now' }).click()
  const file = await (await download).path()
  const saved = JSON.parse(await (await import('node:fs/promises')).readFile(file, 'utf8'))
  expect(saved.tables.journal).toHaveLength(2)
  await expect(page.getByRole('status')).toHaveText('Backup saved.')
})

test('rejects a file that is not a Kaizen backup', async ({ page }) => {
  await page.goto('./#/settings')
  await page.getByTestId('restore-input').setInputFiles({
    name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}'),
  })
  await expect(page.getByRole('status')).toHaveText('Not a Kaizen backup file.')
})
