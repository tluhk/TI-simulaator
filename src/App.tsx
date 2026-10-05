import { useMemo, useState } from 'react'
import { examples } from './data/examples'
import { buildModel, getPredictions, matchingExamples } from './model/ngramModel'
import { tokenize, splitInput } from './model/tokenize'
import { applyTemperature, sampleWeighted } from './model/probability'
import type { HistoryStep, Prediction } from './model/types'

const initialText = examples[1].text
const contextName = (n: number) => ['bigram', 'trigram', '4-gram'][n - 1]
const fmt = (p: number) => `${(p * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`

function App() {
  const [text, setText] = useState(initialText)
  const [analyzedText, setAnalyzedText] = useState(initialText)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [contextLength, setContextLength] = useState(2)
  const [exploreContext, setExploreContext] = useState('Mari läks')
  const [activePattern, setActivePattern] = useState<{context: string[]; token: string} | null>(null)
  const [predictionInput, setPredictionInput] = useState('Mari läks')
  const [generatedInput, setGeneratedInput] = useState('Mari läks')
  const [stepsToGenerate, setStepsToGenerate] = useState(12)
  const [temperature, setTemperature] = useState(1)
  const [strategy, setStrategy] = useState<'greedy'|'weighted'|'temperature'>('greedy')
  const [generationTokens, setGenerationTokens] = useState<string[]>([])
  const [history, setHistory] = useState<HistoryStep[]>([])
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [autoRunning, setAutoRunning] = useState(false)

  const tokens = useMemo(() => tokenize(analyzedText, ignoreCase), [analyzedText, ignoreCase])
  const model = useMemo(() => buildModel(analyzedText, contextLength, ignoreCase), [analyzedText, contextLength, ignoreCase])
  const normalizedExplore = splitInput(exploreContext, ignoreCase)
  const explorePredictions = getPredictions(model, normalizedExplore)
  const predictionTokens = splitInput(predictionInput, ignoreCase)
  const directPrediction = getPredictions(model, predictionTokens)
  const generationContext = [...splitInput(generatedInput, ignoreCase), ...generationTokens].slice(-contextLength)
  const rawGenerationCandidates = getPredictions(model, generationContext)
  const generationCandidates = applyTemperature(rawGenerationCandidates, temperature)
  const generationDisplay = [...splitInput(generatedInput, ignoreCase), ...generationTokens]
  const sampleTotal = directPrediction.reduce((sum, item) => sum + item.count, 0)

  function selectExample(index: number) {
    setText(examples[index].text)
    setAnalyzedText(examples[index].text)
    setActivePattern(null)
    setGenerationTokens([])
    setHistory([])
  }

  function resetGeneration() {
    setGenerationTokens([])
    setHistory([])
    setAutoRunning(false)
  }

  function appendOne() {
    const current = [...splitInput(generatedInput, ignoreCase), ...generationTokens]
    const ctx = current.slice(-contextLength)
    const candidates = getPredictions(model, ctx)
    if (!candidates.length) return false
    const tempered = applyTemperature(candidates, temperature)
    const selected = strategy === 'greedy'
      ? candidates[0]
      : sampleWeighted(tempered, true)
    if (!selected) return false
    const probability = strategy === 'temperature'
      ? selected.adjustedProbability ?? selected.probability
      : selected.probability
    setGenerationTokens((existing) => [...existing, selected.token])
    setHistory((existing) => [...existing, { context: ctx.join(' '), selected: selected.token, probability, candidates: tempered }])
    return true
  }

  function autoGenerate() {
    let current = [...splitInput(generatedInput, ignoreCase), ...generationTokens]
    const nextTokens = [...generationTokens]
    const nextHistory: HistoryStep[] = [...history]
    for (let i = 0; i < stepsToGenerate; i += 1) {
      const ctx = current.slice(-contextLength)
      const candidates = getPredictions(model, ctx)
      if (!candidates.length) break
      const tempered = applyTemperature(candidates, temperature)
      const selected = strategy === 'greedy' ? candidates[0] : sampleWeighted(tempered, true)
      if (!selected) break
      const probability = strategy === 'temperature' ? selected.adjustedProbability ?? selected.probability : selected.probability
      nextTokens.push(selected.token)
      nextHistory.push({ context: ctx.join(' '), selected: selected.token, probability, candidates: tempered })
      current = [...current, selected.token]
    }
    setGenerationTokens(nextTokens)
    setHistory(nextHistory)
    setAutoRunning(false)
  }

  const formatedExamples = activePattern ? matchingExamples(analyzedText, activePattern.context, activePattern.token, contextLength, ignoreCase) : []

  return <main className="page-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">N</span><span>Next Token Lab<small>LANGUAGE MODEL SIMULATOR</small></span></a><div className="top-note"><span className="live-dot"/> Runs entirely in your browser</div></header>
    <section className="hero" id="top">
      <div className="hero-copy"><div className="eyebrow"><span>INTERACTIVE LEARNING TOOL</span><span className="eyebrow-line"/></div><h1>How does a model<br/>choose its <em>next word?</em></h1><p>Train a tiny language model on text you choose. Explore its patterns, inspect the probabilities, and generate a sentence one token at a time.</p><a className="text-link" href="#training">Start exploring <span>↓</span></a></div>
      <div className="hero-visual" aria-label="An illustration of next-token prediction"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="hero-chip chip-context">context</div><div className="hero-chip chip-model">model</div><div className="hero-chip chip-next">next token</div><div className="hero-core"><span className="core-spark">✳</span><span>predict</span></div><div className="hero-token t1">the</div><div className="hero-token t2">day</div><div className="hero-token t3">.</div><div className="hero-token t4">bright</div><div className="hero-path path-one"/><div className="hero-path path-two"/></div>
      <div className="hero-bottom"><span>01 — LEARN BY EXPLORING</span><span>WORDS → PATTERNS → PREDICTIONS</span></div>
    </section>

    <section className="section-heading" id="training"><div><div className="eyebrow"><span>THE WORKSPACE</span><span className="eyebrow-line"/></div><h2>Build your model</h2></div><p>Your text stays on this device.<br/>Nothing is uploaded or saved.</p></section>
    <section className="panel training-panel"><div className="panel-heading"><div className="step-title"><span className="step-index">01</span><div><h3>Training text</h3><p>Paste some text here. The model will learn patterns only from this text.</p></div></div><div className="dataset-picker"><label htmlFor="dataset">EXAMPLE TEXT</label><select id="dataset" onChange={(e) => selectExample(Number(e.target.value))} defaultValue="1">{examples.map((item, i) => <option value={i} key={item.name}>{item.name}</option>)}</select></div></div>
      <textarea aria-label="Training text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a passage here…"/><div className="training-footer"><div className="stats"><Stat value={text.length.toLocaleString()} label="characters"/><Stat value={tokenize(text).length.toLocaleString()} label="tokens"/><Stat value={new Set(tokenize(text)).size.toLocaleString()} label="unique tokens"/><Stat value={(text.trim() ? (text.match(/[.!?…]+(?=\s|$)/gu)?.length ?? 1) : 0).toLocaleString()} label="sentences"/></div><div className="training-actions"><button className="button button-quiet" onClick={() => setText('')}>Clear text</button><button className="button button-primary" onClick={() => { setAnalyzedText(text); setActivePattern(null); resetGeneration() }}>Analyse text <span>↗</span></button></div></div>
    </section>

    <div className="steps-grid">
      <section className="panel token-panel"><PanelTitle number="02" title="Tokenization" subtitle="Text is split into small pieces the model can count."/><p className="explain-copy">Here, words and punctuation are separate tokens. Try switching the case setting to see what changes.</p><label className="check-row"><input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)}/><span>Ignore capitalization</span><span className="mini-tag">NORMALIZE</span></label><div className="token-cloud">{tokens.slice(0, 48).map((token, i) => <span className={`token ${/^[\p{L}\p{M}\p{N}]/u.test(token) ? '' : 'punct'}`} key={`${i}-${token}`}>{token}</span>)}{tokens.length > 48 && <span className="token more-token">+{tokens.length - 48} more</span>}{!tokens.length && <span className="muted">Add text above to see its tokens.</span>}</div><div className="token-legend"><span><i className="legend-word"/> word token</span><span><i className="legend-punct"/> punctuation</span></div></section>
      <section className="panel config-panel"><PanelTitle number="03" title="Context length" subtitle="How many previous tokens should the model consider?"/><p className="explain-copy">A longer context can make a more specific prediction, if that exact pattern appears in the text.</p><div className="choice-list">{[1,2,3].map((count) => <label className={`choice ${contextLength === count ? 'selected' : ''}`} key={count}><input type="radio" name="context" value={count} checked={contextLength === count} onChange={() => { setContextLength(count); setActivePattern(null); resetGeneration() }}/><span className="choice-number">0{count}</span><span className="choice-desc"><strong>{count} previous token{count > 1 ? 's' : ''}</strong><small>Context {count} → {contextName(count)}</small></span><span className="choice-check">✓</span></label>)}</div><div className="model-note"><span className="note-icon">i</span><span>Changing this setting rebuilds the model using <strong>{contextName(contextLength)}</strong> patterns.</span></div></section>
    </div>

    <section className="panel explore-panel"><PanelTitle number="04" title="What did the model learn?" subtitle="Look up a context and inspect the patterns observed after it."/><div className="explore-layout"><div className="explore-controls"><label htmlFor="explore">CONTEXT <span>Use {contextLength} token{contextLength > 1 ? 's' : ''}</span></label><div className="input-with-icon"><span>⌕</span><input id="explore" value={exploreContext} onChange={(e) => { setExploreContext(e.target.value); setActivePattern(null) }} placeholder="For example: Mari läks"/></div><div className="context-preview"><span className="preview-label">MODEL LOOKS AT</span><span className="context-pills">{normalizedExplore.slice(-contextLength).map((token, i) => <span key={`${i}-${token}`}>{token}</span>)}</span></div><p className="micro-copy">Predictions are counts from the analyzed training text.</p></div><div className="distribution-area"><Distribution predictions={explorePredictions} onSelect={(p) => setActivePattern({ context: normalizedExplore, token: p.token })} selectedToken={activePattern?.token}/>{explorePredictions.length === 0 && <div className="empty-state"><span>↗</span><strong>No pattern found yet</strong><p>Try a different context, or use one from your training text.</p></div>}</div></div>{activePattern && <div className="evidence-box"><div className="evidence-heading"><span className="evidence-mark">⌕</span><div><strong>Where did “{activePattern.token}” come from?</strong><small>{formatedExamples.length} matching occurrence{formatedExamples.length === 1 ? '' : 's'} found</small></div><button className="icon-button" onClick={() => setActivePattern(null)} aria-label="Close examples">×</button></div><div className="evidence-examples">{formatedExamples.slice(0, 6).map((example, i) => <p key={i}>{example.map((token, j) => <span className={j >= example.length - 4 && j < example.length - 3 ? 'highlight-context' : j === example.length - 3 ? 'highlight-next' : ''} key={j}>{token}{j < example.length - 1 && !/^[,.!?;:…]/u.test(example[j + 1]) ? ' ' : ''}</span>)}</p>)}</div></div>}</section>

    <div className="steps-grid prediction-grid"><section className="panel prediction-panel"><PanelTitle number="05" title="Predict the next token" subtitle="Enter a phrase to see the model’s next-token distribution."/><label className="field-label" htmlFor="prediction">STARTING PHRASE</label><div className="input-row"><input id="prediction" value={predictionInput} onChange={(e) => setPredictionInput(e.target.value)} placeholder="Type a phrase…"/><button className="button button-primary" onClick={() => setActivePattern(null)}>Predict <span>↗</span></button></div><div className="prediction-result">{directPrediction.length ? <><div className="result-summary"><span className="result-dot"/>Based on <strong>{sampleTotal} matching occurrence{sampleTotal === 1 ? '' : 's'}</strong> in the training text<span className="result-model">{contextName(contextLength)}</span></div><Distribution predictions={directPrediction.slice(0, 10)} onSelect={(p) => setActivePattern({ context: predictionTokens, token: p.token })}/><div className="calculation">P(next token | context) = <strong>count of matching pattern ÷ {sampleTotal} total matches</strong></div></> : <div className="empty-state compact"><span>↗</span><strong>No {contextName(contextLength)} match was found</strong><p>The model can only predict contexts it encountered in the training text.</p></div>}</div></section>
      <section className="panel comparison-panel"><PanelTitle number="↔" title="Compare context lengths" subtitle="The same phrase can lead to different predictions."/><label className="field-label" htmlFor="compare">TRY A PHRASE</label><div className="input-with-icon compare-input"><span>⌕</span><input id="compare" value={predictionInput} onChange={(e) => setPredictionInput(e.target.value)} placeholder="For example: Mari läks"/></div><div className="comparison-cards">{[1,2,3].map((n) => { const predictions = getPredictions(buildModel(analyzedText, n, ignoreCase), splitInput(predictionInput, ignoreCase)); return <div className="comparison-card" key={n}><div className="comparison-card-head"><span>Context {n}</span><small>{contextName(n)}</small></div>{predictions.slice(0, 3).length ? predictions.slice(0,3).map((p) => <div className="comparison-row" key={p.token}><span>{p.token}</span><span>{fmt(p.probability)}</span></div>) : <div className="comparison-empty">No match</div>}</div>})}</div><p className="micro-copy comparison-caption">Longer context changes which occurrences count as a match.</p></section></div>

    <section className="panel generator-panel"><div className="generator-heading"><PanelTitle number="06" title="Generate text" subtitle="Watch the model continue your phrase, one token at a time."/><button className="button button-quiet reset-button" onClick={resetGeneration}>↺ Reset generation</button></div><div className="generator-layout"><div className="generator-controls"><label className="field-label" htmlFor="generation-start">STARTING PHRASE</label><input id="generation-start" value={generatedInput} onChange={(e) => { setGeneratedInput(e.target.value); resetGeneration() }} placeholder="Type a phrase…"/><label className="field-label control-spaced" htmlFor="strategy">SELECTION STRATEGY</label><select id="strategy" value={strategy} onChange={(e) => setStrategy(e.target.value as typeof strategy)}><option value="greedy">Greedy — choose the most likely</option><option value="weighted">Weighted random — follow the distribution</option><option value="temperature">Temperature sampling — adjust then sample</option></select><div className="range-label"><label htmlFor="temperature">TEMPERATURE</label><span>{temperature.toFixed(1)}</span></div><input id="temperature" className="range-input" type="range" min="0.1" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}/><p className="micro-copy range-help">Lower values concentrate probability on likely tokens. Higher values make less likely tokens more likely.</p><div className="range-label token-range-label"><label htmlFor="steps">TOKENS TO GENERATE</label><span>{stepsToGenerate}</span></div><input id="steps" className="range-input" type="range" min="1" max="50" step="1" value={stepsToGenerate} onChange={(e) => setStepsToGenerate(Number(e.target.value))}/><div className="generator-buttons"><button className="button button-secondary" onClick={appendOne} disabled={!rawGenerationCandidates.length || generationTokens.length >= 50}>Generate next token <span>→</span></button><button className="button button-primary" onClick={autoGenerate} disabled={!rawGenerationCandidates.length || autoRunning}>Generate automatically <span>↗</span></button></div><p className="micro-copy mode-note">Step mode lets you inspect every choice. Automatic mode continues for the selected number of tokens or until the model runs out of matching patterns.</p></div>
      <div className="generation-output"><div className="output-topline"><span>GENERATED TEXT</span><span className="output-state"><i/>LIVE MODEL OUTPUT</span></div><div className="generated-text">{generationDisplay.map((token, i) => <span className={i >= generationDisplay.length - generationTokens.length ? 'new-token' : ''} key={`${i}-${token}`}>{token}{i < generationDisplay.length - 1 && !/^[,.!?;:…]/u.test(generationDisplay[i + 1]) ? ' ' : ''}</span>)}{generationDisplay.length === 0 && <span className="generated-placeholder">Your generated text will appear here…</span>}</div><div className="temperature-comparison"><div className="comparison-title"><span>PROBABILITY DISTRIBUTION</span><small>live temperature preview</small></div>{generationCandidates.length ? <><div className="temp-legend"><span><i className="legend-original"/>Original</span><span><i className="legend-adjusted"/>After temperature</span></div><div className="temp-chart">{generationCandidates.slice(0,5).map((p) => <div className="temp-row" key={p.token}><span className="temp-token">{p.token}</span><div className="paired-bars"><i style={{width: `${p.probability * 100}%`}}/><b style={{width: `${(p.adjustedProbability ?? 0) * 100}%`}}/></div><span className="temp-value">{fmt(p.adjustedProbability ?? p.probability)}</span></div>)}</div></> : <p className="distribution-empty">No candidates for the current context. Try an earlier phrase or a different training text.</p>}</div></div></div>
      <div className="history-section"><div className="history-heading"><div><span className="field-label">GENERATION HISTORY</span><p>Every selection, with its context and candidate distribution.</p></div><span className="history-count">{history.length} STEP{history.length === 1 ? '' : 'S'}</span></div>{history.length ? <div className="history-list">{history.map((step, i) => <div className="history-item" key={`${i}-${step.selected}`}><button className="history-trigger" onClick={() => setExpandedStep(expandedStep === i ? null : i)}><span className="history-number">{String(i + 1).padStart(2,'0')}</span><span className="history-context"><small>CONTEXT</small><strong>{step.context || '∅'}</strong></span><span className="history-arrow">→</span><span className="history-selected"><small>SELECTED</small><strong>{step.selected}</strong></span><span className="history-probability">{fmt(step.probability)}</span><span className={`history-chevron ${expandedStep === i ? 'open' : ''}`}>⌄</span></button>{expandedStep === i && <div className="history-detail"><span>Candidate distribution for this step</span><Distribution predictions={step.candidates} highlight={step.selected}/></div>}</div>)}</div> : <div className="history-empty">Your generation steps will be recorded here as you go.</div>}</div>
    </section>

    <section className="explanation-section"><div className="explanation-copy"><div className="eyebrow"><span>THE BIGGER PICTURE</span><span className="eyebrow-line"/></div><h2>How is this related<br/>to a Large Language Model?</h2><p>This simulator counts patterns directly in a small piece of text. A modern LLM learns far more complex statistical patterns with a neural network trained on very large datasets.</p><p>But you can understand both through the same basic generation loop: predict one token, add it to the context, then predict again.</p><div className="notice"><span>!</span><p><strong>This is an n-gram language model, not a Large Language Model.</strong><br/>It is deliberately simplified to demonstrate the idea of next-token prediction.</p></div><p className="truth-note">A fluent continuation is not proof of knowledge or truth. This model can only reuse patterns present in its training text.</p></div><div className="flow-card"><div className="flow-heading"><span>THE GENERATION LOOP</span><span>↻ REPEATS</span></div><div className="flow-step"><span className="flow-index">01</span><span>Read the current context</span><i>Context</i></div><div className="flow-connector">↓</div><div className="flow-step"><span className="flow-index">02</span><span>Look up observed continuations</span><i>Model</i></div><div className="flow-connector">↓</div><div className="flow-step"><span className="flow-index">03</span><span>Assign probability to each token</span><i>Distribution</i></div><div className="flow-connector">↓</div><div className="flow-step selected-flow"><span className="flow-index">04</span><span>Select one possible token</span><i>Next token</i></div><div className="flow-return"><span>05</span> Append to context and repeat <span>↶</span></div></div></section>
    <footer className="footer"><a className="brand" href="#top"><span className="brand-mark">N</span><span>Next Token Lab<small>LEARN BY EXPLORING</small></span></a><span>Built for curious minds · Runs locally in your browser</span><a href="#top">Back to top ↑</a></footer>
  </main>
}

function Stat({value,label}: {value: string; label: string}) { return <div className="stat"><strong>{value}</strong><span>{label}</span></div> }
function PanelTitle({number,title,subtitle}: {number: string; title: string; subtitle: string}) { return <div className="step-title panel-title"><span className="step-index">{number}</span><div><h3>{title}</h3><p>{subtitle}</p></div></div> }
function Distribution({predictions,onSelect,selectedToken,highlight}: {predictions: Prediction[]; onSelect?: (p: Prediction) => void; selectedToken?: string; highlight?: string}) {
  return <div className="distribution">{predictions.map((p) => <button type="button" className={`distribution-row ${selectedToken === p.token || highlight === p.token ? 'is-selected' : ''} ${onSelect ? 'clickable' : ''}`} onClick={() => onSelect?.(p)} key={p.token}><span className="distribution-token">{p.token}</span><span className="bar-track"><i style={{width: `${Math.max(p.probability * 100, 1)}%`}}/></span><span className="distribution-count">{p.count}×</span><span className="distribution-pct">{fmt(p.probability)}</span></button>)}</div>
}

export default App
