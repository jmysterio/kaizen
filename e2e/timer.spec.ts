import { expect, test } from '@playwright/test'

test('timer survives close and reopen, excludes pause, never overlaps', async ({ page }) => {
  await page.clock.install({ time: new Date(2027, 0, 5, 12, 0, 0) })
  await page.goto('./#/timer')
  await page.getByLabel('Activity').first().fill('Guitar')
  await page.getByRole('button', { name: 'Start' }).click()
  await expect(page.getByTestId('elapsed')).toHaveText('0:00:00')

  await page.clock.runFor(10 * 60_000)
  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible()
  await page.clock.runFor(30 * 60_000)
  await page.getByRole('button', { name: 'Resume' }).click()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible() // let the write land before closing

  // Close the page; time passes while it is closed.
  await page.goto('about:blank')
  await page.clock.setSystemTime(new Date(2027, 0, 5, 12, 45, 0)) // resumed at 12:40, so 10m + 5m
  await page.goto('./#/timer')
  await expect(page.getByTestId('elapsed')).toHaveText('0:15:00')

  // A second timer is impossible: starting another one switches.
  await page.getByLabel('Activity').first().fill('Read')
  await page.getByRole('button', { name: 'Switch' }).click()
  await expect(page.getByRole('timer')).toHaveCount(1)
  await expect(page.getByText('Guitar').first()).toBeVisible()
  await page.getByRole('button', { name: 'Stop' }).click()
  await expect(page.getByRole('timer')).toHaveCount(0)
  await expect(page.getByTestId('today-total')).toHaveText('15m')

  // Manual entry validation.
  await page.getByRole('button', { name: 'Add entry' }).click()
  await page.getByLabel('Activity').last().fill('Walk')
  await page.getByLabel('Start').fill('2027-01-05T09:00')
  await page.getByLabel('End').fill('2027-01-05T08:00')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('alert')).toHaveText('End must be after start.')
  await page.getByLabel('End').fill('2027-01-05T09:30')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByTestId('today-total')).toHaveText('45m')
})
