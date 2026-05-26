import { describe, it, expect } from 'vitest'
import { fallbackPrompts, type Category, type Difficulty } from '../../data/fallbackPrompts'

const CATEGORIES: Category[] = ['opinion', 'personal', 'hypothetical', 'explain', 'wildcard', 'freestyle']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

describe('fallbackPrompts', () => {
  it('has exactly 48 prompts', () => {
    expect(fallbackPrompts).toHaveLength(48)
  })

  it('has 8 prompts per category', () => {
    for (const cat of CATEGORIES) {
      const count = fallbackPrompts.filter(p => p.category === cat).length
      expect(count, `category ${cat}`).toBe(8)
    }
  })

  it('each prompt has required fields', () => {
    for (const p of fallbackPrompts) {
      expect(p.id).toBeTruthy()
      expect(p.text).toBeTruthy()
      expect(CATEGORIES).toContain(p.category)
      expect(DIFFICULTIES).toContain(p.difficulty)
      expect(typeof p.isFreestyle).toBe('boolean')
    }
  })

  it('all freestyle prompts have isFreestyle=true', () => {
    const freestyle = fallbackPrompts.filter(p => p.category === 'freestyle')
    expect(freestyle.every(p => p.isFreestyle)).toBe(true)
  })

  it('all non-freestyle prompts have isFreestyle=false', () => {
    const nonFreestyle = fallbackPrompts.filter(p => p.category !== 'freestyle')
    expect(nonFreestyle.every(p => !p.isFreestyle)).toBe(true)
  })

  it('all ids are unique', () => {
    const ids = fallbackPrompts.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
