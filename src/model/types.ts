export type Prediction = { token: string; count: number; probability: number; adjustedProbability?: number }
export type NgramModel = { contextLength: number; counts: Map<string, Map<string, number>>; totals: Map<string, number> }
export type HistoryStep = { context: string; selected: string; probability: number; candidates: Prediction[] }
