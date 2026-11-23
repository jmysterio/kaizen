import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

// 1×1 PNG — enough to exercise decode → resize → store.
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')

test('your own photo is saved on the device, survives reload, goes into backups, and can be reset', async ({ page }) => {
  await page.goto('./#/settings')
  const row = page.getByRole('listitem').filter({ hasText: 'Morning' })
  await expect(row).toContainText('Default')

  await page.getByLabel('Choose Morning photo').setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: png })
  await expect(row).toContainText('Your photo')
  await page.reload()
  await expect(row).toContainText('Your photo')

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Back up now' }).click()
  const backup = JSON.parse(await readFile(await (await download).path(), 'utf8'))
  const saved = backup.tables.settings.find((s: { key: string }) => s.key === 'photo.morning')
  expect(saved.value).toMatch(/^data:image\/jpeg;base64,/)

  await page.getByRole('button', { name: 'Use default Morning photo' }).click()
  await expect(row).toContainText('Default')
})
