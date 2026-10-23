export interface XYDraft {
  id: string
  x: string
  y: string
}

export function createXYDraft(): XYDraft {
  return { id: `row-${Math.random().toString(36).slice(2, 10)}`, x: '', y: '' }
}

export function createXYDrafts(count: number) {
  return Array.from({ length: count }, () => createXYDraft())
}
