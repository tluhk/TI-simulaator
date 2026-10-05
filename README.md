# Next Token Lab — Language model simulator

An interactive, browser-only teaching tool for exploring how language models predict what comes next. Students can train a simple n-gram model on English, Estonian, or their own text, inspect the counts and probabilities behind its predictions, and generate text one token at a time.

## Educational goals

- See text become word-level tokens, with punctuation kept separate.
- Explore how context length changes which patterns count as a match.
- Compare observed counts with the resulting probability distribution.
- Watch a token get selected and appended to the context at each generation step.
- Experiment with greedy, weighted random, and temperature sampling.
- Notice the limits of a model that can only reuse patterns in its training text.

All processing happens in the browser. Text is not uploaded to a backend or stored in a database.

## How the n-gram model works

The tokenizer separates Unicode words and punctuation. For a context length of `N`, the model moves through the token sequence and counts every token that follows each sequence of `N` tokens. A prediction probability is the count for that next token divided by all observed continuations of the context. For example, if `Mari läks` is followed by `kooli` twice and `koju` once, their probabilities are `2/3` and `1/3`.

Generation repeats this process: read the last N tokens, retrieve their observed next-token distribution, select one token, append it, and continue. Temperature transforms probabilities with a power scaling and normalization: values below 1 concentrate probability on likely tokens, while values above 1 flatten the distribution. Case is preserved unless “Ignore capitalization” is selected.

## How this differs from an LLM

This is an n-gram model, not a Large Language Model. It uses direct counting in a small text and cannot generalize beyond the contexts it has seen. Modern LLMs learn complex statistical patterns with neural networks and very large training datasets. Both can be introduced as repeated next-token prediction, but their scale and underlying model are very different. Fluent generated text should not be mistaken for knowledge or truth.

## Installation and development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Vite prints the local development URL (usually `http://localhost:5173`). The app does not need a server-side component.

## Production build

```bash
npm run build
npm run preview
```

The static production site is written to `dist/`.

## GitHub Pages deployment

The included GitHub Actions workflow builds and deploys the site when changes are pushed to `main`, or when manually started from the Actions tab. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The Vite base path is configured for this repository name (`TI-simulaator`) in the workflow and remains `/` during local development. If the repository is renamed, update the base path in `vite.config.ts`.

For a manual deployment, the `deploy` script uses `gh-pages`:

```bash
npm run deploy
```

## Project structure

```text
src/
  App.tsx             React learning interface
  styles.css          Responsive academic visual design
  data/examples.ts    English, Estonian, and story examples
  model/
    tokenize.ts       Unicode-aware tokenization
    ngramModel.ts     Context counts and pattern evidence
    probability.ts    Temperature scaling and weighted sampling
    types.ts          Shared model types
.github/workflows/
  deploy.yml          GitHub Pages build and deployment
```

The pure functions in `src/model/` are kept separate from the UI so they are easy to inspect or unit test.

## Suggested classroom activity

1. Paste a short text into the training area.
2. Test several starting phrases.
3. Compare context lengths 1, 2, and 3.
4. Generate text using greedy selection.
5. Switch to weighted sampling.
6. Increase the temperature.
7. Discuss why the results change.
8. Replace the training data with a very different text and repeat the experiment.
