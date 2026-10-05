import type { Prediction } from './types'

export function applyTemperature(predictions: Prediction[], temperature: number): Prediction[] {
  if (predictions.length === 0) return []
  const t = Math.max(0.01, temperature)
  const weights = predictions.map((item) => Math.pow(item.probability, 1 / t))
  const sum = weights.reduce((a, b) => a + b, 0)
  return predictions.map((item, index) => ({ ...item, adjustedProbability: weights[index] / sum }))
}

export function sampleWeighted<T extends { probability?: number; adjustedProbability?: number }>(items: T[], adjusted = false): T | undefined {
  if (!items.length) return undefined
  const total = items.reduce((sum, item) => sum + (adjusted ? item.adjustedProbability ?? 0 : item.probability ?? 0), 0)
  let needle = Math.random() * total
  for (const item of items) {
    needle -= adjusted ? item.adjustedProbability ?? 0 : item.probability ?? 0
    if (needle <= 0) return item
  }
  return items[items.length - 1]
}
