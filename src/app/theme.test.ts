import { describe, expect, it } from 'vitest'
import { fitWithin } from '../data/repos/photos'
import { resolveTheme, themeForHour } from './theme'

describe('theme', () => {
  it('picks by time of day', () => {
    expect([0, 10, 11, 16, 17, 23].map(themeForHour)).toEqual(['morning', 'morning', 'day', 'day', 'evening', 'evening'])
  })

  it('a manual choice wins; unknown or old values fall back to Automatic', () => {
    expect(resolveTheme('evening', 8)).toBe('evening')
    expect(resolveTheme('auto', 8)).toBe('morning')
    expect(resolveTheme('dark', 20)).toBe('evening') // old System/Light/Dark setting
    expect(resolveTheme(undefined, 12)).toBe('day')
  })
})

describe('photo sizing', () => {
  it('shrinks the long side to the max and never enlarges', () => {
    expect(fitWithin(4032, 3024, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(fitWithin(3024, 4032, 1600)).toEqual({ width: 1200, height: 1600 })
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })
})
