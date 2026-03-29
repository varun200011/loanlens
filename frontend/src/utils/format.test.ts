import { formatINR, formatPct, gradeColor, riskBandColor } from './format'

describe('format utilities', () => {
  test('formatINR formats Indian currency correctly', () => {
    expect(formatINR(75000)).toContain('75,000')
    expect(formatINR(1000000)).toContain('10,00,000')
    expect(formatINR(0)).toContain('0')
  })

  test('formatPct formats percentage', () => {
    expect(formatPct(35.5)).toBe('35.5%')
    expect(formatPct(100)).toBe('100.0%')
  })

  test('gradeColor returns green for A grades', () => {
    expect(gradeColor('A+')).toBe('var(--green)')
    expect(gradeColor('A')).toBe('var(--green)')
  })

  test('gradeColor returns red for F grade', () => {
    expect(gradeColor('F')).toBe('var(--red)')
  })

  test('riskBandColor returns green for GREEN band', () => {
    expect(riskBandColor('GREEN')).toBe('var(--green)')
  })

  test('riskBandColor returns red for RED and CRITICAL bands', () => {
    expect(riskBandColor('RED')).toBe('var(--red)')
    expect(riskBandColor('CRITICAL')).toBe('#ff0000')
  })
})
