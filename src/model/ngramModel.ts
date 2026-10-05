import type { NgramModel, Prediction } from './types'
import { tokenize } from './tokenize'

export function buildModel(text: string, contextLength: number, ignoreCapitalization = false): NgramModel {
  const tokens = tokenize(text, ignoreCapitalization)
  const counts = new Map<string, Map<string, number>>()
  const totals = new Map<string, number>()
  for (let i = contextLength; i < tokens.length; i += 1) {
    const key = JSON.stringify(tokens.slice(i - contextLength, i))
    const next = tokens[i]
    const options = counts.get(key) ?? new Map<string, number>()
    options.set(next, (options.get(next) ?? 0) + 1)
    counts.set(key, options)
    totals.set(key, (totals.get(key) ?? 0) + 1)
  }
  return { contextLength, counts, totals }
}

export function getPredictions(model: NgramModel, context: string[]): Prediction[] {
  if (context.length < model.contextLength) return []
  const key = JSON.stringify(context.slice(-model.contextLength))
  const options = model.counts.get(key)
  const total = model.totals.get(key) ?? 0
  if (!options || total === 0) return []
  return [...options.entries()]
    .map(([token, count]) => ({ token, count, probability: count / total }))
    .sort((a, b) => b.probability - a.probability || a.token.localeCompare(b.token))
}

export function matchingExamples(text: string, context: string[], nextToken: string, contextLength: number, ignoreCapitalization = false): string[][] {
  const tokens = tokenize(text, ignoreCapitalization)
  const matches: string[][] = []
  for (let i = contextLength; i < tokens.length; i += 1) {
    const before = tokens.slice(i - contextLength, i)
    if (JSON.stringify(before) === JSON.stringify(context.slice(-contextLength)) && tokens[i] === nextToken) {
      matches.push(tokens.slice(Math.max(0, i - contextLength), Math.min(tokens.length, i + 4)))
    }
  }
  return matches
}
