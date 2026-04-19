import { describe, it, expect } from 'vitest'
import {
  PERSPECTIVES,
  PERSPECTIVE_LABELS,
  PERSPECTIVE_DESCRIPTIONS,
  PERSPECTIVE_THEMES,
  PERSPECTIVE_ACCENT,
  EXPORT_STAGES,
} from '../types/bsc'
import type { Perspective, Language } from '../types/bsc'

const LANGUAGES: Language[] = ['ka', 'en']

// Georgian unicode block: U+10D0–U+10FF
function hasGeorgianText(str: string): boolean {
  return /[\u10D0-\u10FF]/.test(str)
}

describe('PERSPECTIVES', () => {
  it('has exactly 4 items', () => {
    expect(PERSPECTIVES).toHaveLength(4)
  })

  it('contains financial, customer, internal, learning', () => {
    expect(PERSPECTIVES).toContain('financial')
    expect(PERSPECTIVES).toContain('customer')
    expect(PERSPECTIVES).toContain('internal')
    expect(PERSPECTIVES).toContain('learning')
  })

  it('contains no duplicates', () => {
    expect(new Set(PERSPECTIVES).size).toBe(4)
  })
})

describe('PERSPECTIVE_LABELS', () => {
  it('has a ka and en entry for every perspective', () => {
    for (const p of PERSPECTIVES) {
      expect(PERSPECTIVE_LABELS[p], `missing entry for ${p}`).toBeDefined()
      for (const lang of LANGUAGES) {
        expect(
          typeof PERSPECTIVE_LABELS[p][lang],
          `${p}.${lang} should be a string`
        ).toBe('string')
        expect(PERSPECTIVE_LABELS[p][lang].length).toBeGreaterThan(0)
      }
    }
  })

  it('Georgian (ka) labels contain Georgian unicode characters', () => {
    for (const p of PERSPECTIVES) {
      expect(
        hasGeorgianText(PERSPECTIVE_LABELS[p].ka),
        `${p} ka label should contain Georgian text`
      ).toBe(true)
    }
  })

  it('English (en) labels contain only ASCII-range characters', () => {
    for (const p of PERSPECTIVES) {
      expect(
        hasGeorgianText(PERSPECTIVE_LABELS[p].en),
        `${p} en label should not contain Georgian text`
      ).toBe(false)
    }
  })
})

describe('PERSPECTIVE_DESCRIPTIONS', () => {
  it('has a ka and en description for every perspective', () => {
    for (const p of PERSPECTIVES) {
      expect(PERSPECTIVE_DESCRIPTIONS[p], `missing entry for ${p}`).toBeDefined()
      for (const lang of LANGUAGES) {
        expect(
          typeof PERSPECTIVE_DESCRIPTIONS[p][lang],
          `${p}.${lang} should be a string`
        ).toBe('string')
        expect(PERSPECTIVE_DESCRIPTIONS[p][lang].length).toBeGreaterThan(0)
      }
    }
  })

  it('Georgian (ka) descriptions contain Georgian unicode characters', () => {
    for (const p of PERSPECTIVES) {
      expect(
        hasGeorgianText(PERSPECTIVE_DESCRIPTIONS[p].ka),
        `${p} ka description should contain Georgian text`
      ).toBe(true)
    }
  })

  it('descriptions cover all four perspectives without extra keys', () => {
    const keys = Object.keys(PERSPECTIVE_DESCRIPTIONS) as Perspective[]
    expect(keys.sort()).toEqual([...PERSPECTIVES].sort())
  })
})

describe('PERSPECTIVE_THEMES', () => {
  it('has a ka and en array of themes for every perspective', () => {
    for (const p of PERSPECTIVES) {
      expect(PERSPECTIVE_THEMES[p], `missing entry for ${p}`).toBeDefined()
      for (const lang of LANGUAGES) {
        expect(
          Array.isArray(PERSPECTIVE_THEMES[p][lang]),
          `${p}.${lang} should be an array`
        ).toBe(true)
        expect(
          PERSPECTIVE_THEMES[p][lang].length,
          `${p}.${lang} should have at least 1 theme`
        ).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('every theme object has non-empty label and examples strings', () => {
    for (const p of PERSPECTIVES) {
      for (const lang of LANGUAGES) {
        for (const theme of PERSPECTIVE_THEMES[p][lang]) {
          expect(typeof theme.label).toBe('string')
          expect(theme.label.length).toBeGreaterThan(0)
          expect(typeof theme.examples).toBe('string')
          expect(theme.examples.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('ka themes contain Georgian unicode characters in labels', () => {
    for (const p of PERSPECTIVES) {
      for (const theme of PERSPECTIVE_THEMES[p].ka) {
        expect(
          hasGeorgianText(theme.label),
          `${p} ka theme label "${theme.label}" should contain Georgian text`
        ).toBe(true)
      }
    }
  })

  it('ka themes do not use ლოჯ (incorrect spelling) — must use ლოგ', () => {
    for (const p of PERSPECTIVES) {
      for (const theme of PERSPECTIVE_THEMES[p].ka) {
        expect(theme.label).not.toMatch(/ლოჯ/)
        expect(theme.examples).not.toMatch(/ლოჯ/)
      }
    }
  })
})

describe('PERSPECTIVE_ACCENT', () => {
  const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

  it('has a hex color for every perspective', () => {
    for (const p of PERSPECTIVES) {
      expect(PERSPECTIVE_ACCENT[p], `missing accent for ${p}`).toBeDefined()
      expect(
        HEX_COLOR.test(PERSPECTIVE_ACCENT[p]),
        `${p} accent "${PERSPECTIVE_ACCENT[p]}" should be a 6-digit hex color`
      ).toBe(true)
    }
  })

  it('has no extra keys beyond the four perspectives', () => {
    const keys = Object.keys(PERSPECTIVE_ACCENT) as Perspective[]
    expect(keys.sort()).toEqual([...PERSPECTIVES].sort())
  })

  it('all four accent colors are distinct', () => {
    const colors = PERSPECTIVES.map((p) => PERSPECTIVE_ACCENT[p])
    expect(new Set(colors).size).toBe(4)
  })
})

describe('EXPORT_STAGES', () => {
  it('has a ka and en array', () => {
    expect(Array.isArray(EXPORT_STAGES.ka)).toBe(true)
    expect(Array.isArray(EXPORT_STAGES.en)).toBe(true)
  })

  it('has exactly 4 stages for both languages', () => {
    expect(EXPORT_STAGES.ka).toHaveLength(4)
    expect(EXPORT_STAGES.en).toHaveLength(4)
  })

  it('every stage has a non-empty value and label', () => {
    for (const lang of LANGUAGES) {
      for (const stage of EXPORT_STAGES[lang]) {
        expect(typeof stage.value).toBe('string')
        expect(stage.value.length).toBeGreaterThan(0)
        expect(typeof stage.label).toBe('string')
        expect(stage.label.length).toBeGreaterThan(0)
      }
    }
  })

  it('ka stage labels contain Georgian unicode characters', () => {
    for (const stage of EXPORT_STAGES.ka) {
      expect(
        hasGeorgianText(stage.label),
        `ka stage "${stage.value}" label should contain Georgian text`
      ).toBe(true)
    }
  })

  it('ka and en stages share the same value keys in the same order', () => {
    const kaValues = EXPORT_STAGES.ka.map((s) => s.value)
    const enValues = EXPORT_STAGES.en.map((s) => s.value)
    expect(kaValues).toEqual(enValues)
  })

  it('stage values are the expected export stage identifiers', () => {
    const expectedValues = ['pre_export', 'first_export', 'active_export', 'scaling']
    const kaValues = EXPORT_STAGES.ka.map((s) => s.value)
    expect(kaValues).toEqual(expectedValues)
  })
})
