Create an educational web application that demonstrates, in a simple and interactive way, the basic idea behind language models: predicting the next token based on previous context.

The application is intended for university students who are being introduced to large language models and generative AI. The main goal is conceptual understanding, not mathematical depth.

## Main concept

The student should be able to paste any text into the application. The application should analyse this text and build a simple statistical language model from it.

The student can then enter a starting word or phrase and observe how the model predicts possible next tokens based only on patterns found in the pasted text.

The application should clearly demonstrate this process:

training text -> tokenization -> observed patterns -> probability distribution -> next-token selection -> generated text

The application must make it clear that this simple statistical model is NOT an actual large language model, but that the central idea of repeatedly predicting the next token is related to how generative language models work.

## Technical requirements

Build the application using:

- React
- TypeScript
- Vite
- client-side processing only
- no backend
- no external database
- suitable for deployment to GitHub Pages
- responsive desktop-first interface that also works on tablets

Avoid unnecessary dependencies.

The whole application must work locally after:

npm install
npm run dev

Also configure the project so it can be deployed to GitHub Pages.

## Main application layout

Create a clean educational interface divided into logical steps.

### Step 1: Training text

Provide a large textarea titled:

"1. Training text"

Explain briefly:

"Paste some text here. The model will learn patterns only from this text."

Include a useful default example text so the application works immediately.

The student must be able to:

- paste arbitrary text
- replace the sample text
- clear the text
- load one of several built-in example texts

Provide at least three example datasets:

- a short simple English text
- a short simple Estonian text
- a slightly larger story-like text

Display basic statistics:

- number of characters
- number of words/tokens
- number of unique tokens
- number of sentences

Provide an "Analyse text" button.

## Step 2: Tokenization

After analysis, show:

"2. Tokenization"

Display the beginning of the text as individual visual token boxes.

For example:

[Today] [is] [a] [beautiful] [day] [.]

Explain briefly what a token is.

For this first version, use word-level tokens plus punctuation as separate tokens.

Tokenization should:

- be case-sensitive by default
- treat punctuation as separate tokens
- preserve Estonian characters correctly
- work with Unicode

Add a checkbox:

"Ignore capitalization"

When enabled, normalize words to lowercase before model training.

## Step 3: Model configuration

Show:

"3. Context length"

Allow the student to choose:

- 1 previous token: bigram model
- 2 previous tokens: trigram model
- 3 previous tokens: 4-gram model

Use simple student-friendly terminology.

For example:

"Context length tells the model how many previous tokens it looks at when predicting the next one."

Show the formal model name in smaller text:

Context 1 -> bigram
Context 2 -> trigram
Context 3 -> 4-gram

Rebuild the model when the context length changes.

## Step 4: Explore learned patterns

Create an interactive section:

"4. What did the model learn?"

Allow the student to select or type a token or sequence of tokens.

Show all next tokens that were observed after that context in the training text.

For example:

Context:

Mari läks

Results:

kooli 4 times 50%
koju 2 times 25%
poodi 1 time 12.5%
õue 1 time 12.5%

Visualize probabilities using horizontal bars.

Sort predictions from most likely to least likely.

Show:

- token
- occurrence count
- probability
- visual probability bar

Probabilities must be calculated directly from the occurrences in the training text.

If possible, make each prediction clickable.

When clicking a prediction, show examples of where that pattern occurred in the original training text.

For example:

"Mari läks kooli."

Highlight the context and predicted next token.

This is pedagogically important because students should be able to see where the probability came from.

## Step 5: Next-token prediction

Create a section titled:

"5. Predict the next token"

Provide an input field where the student can type a starting phrase.

Example:

Mari läks

When the student presses "Predict", display the probability distribution for the next token.

Show at least the top 10 possibilities if available.

Example:

kooli 50%
koju 25%
poodi 12.5%
õue 12.5%

Clearly show:

"Based on 8 matching occurrences in the training text."

If the context does not exist in the training data, explain that the model cannot make a prediction using the selected context length.

Optionally fall back to a shorter context, but if this is implemented, make the fallback visible to the student.

For example:

"No trigram match was found. Falling back to a bigram prediction."

## Step 6: Generate text

Create an interactive text generation section:

"6. Generate text"

The student provides a starting phrase and chooses:

- number of tokens to generate: 1 to 50
- temperature
- selection strategy

Provide these selection strategies:

1. Greedy
   Always select the most probable next token.

2. Weighted random
   Randomly select according to the probability distribution.

3. Temperature sampling
   Modify the probability distribution using temperature before sampling.

Provide a temperature slider from approximately:

0.1 to 2.0

Default: 1.0

Explain:

"Lower temperature makes the model more predictable. Higher temperature makes less likely tokens more likely to be selected."

When generating, do NOT generate the entire result immediately.

Provide two modes:

- "Generate next token"
- "Generate automatically"

The "Generate next token" mode is especially important.

Each click should:

1. show the current context
2. show the candidate tokens and probabilities
3. visually indicate which token was selected
4. append it to the generated text

This should allow the student to observe generation step by step.

## Probability visualization

Whenever a prediction is made, show a visual distribution.

For example:

Next token probabilities

kooli ████████████████████ 50%
koju ██████████ 25%
poodi █████ 12.5%
õue █████ 12.5%

Use proper responsive CSS bars rather than text characters.

When temperature changes, display both:

Original probability

and

Probability after temperature

This will make the effect of temperature visible.

## Generation history

Create a small history panel that records every generation step.

For example:

Step 1
Context: "Mari läks"
Selected: "kooli"
Probability: 50%

Step 2
Context: "läks kooli"
Selected: "."
Probability: 75%

Step 3
Context: "kooli ."
Selected: "Mari"
Probability: 40%

Allow the student to expand a step to see the full candidate distribution.

Provide a "Reset generation" button.

## Educational explanation

Include a section at the bottom:

"How is this related to a Large Language Model?"

Keep the explanation concise and accessible.

Explain that this application uses direct counting of patterns in a small training text.

A modern LLM instead learns complex statistical patterns using a neural network and very large training datasets.

However, both can be understood through the same basic generation loop:

1. Read the current context.
2. Calculate possible next tokens.
3. Assign probabilities.
4. Select one token.
5. Add the token to the context.
6. Repeat.

Create a visual flow such as:

Context
↓
Model
↓
Possible next tokens
↓
Probability distribution
↓
Select token
↓
Append token
↺ Repeat

Also include a clearly styled notice:

"This is an n-gram language model, not a Large Language Model. It is deliberately simplified to demonstrate the idea of next-token prediction."

## Optional comparison mode

If practical, create a comparison section where the same starting phrase can be tested using:

- context length 1
- context length 2
- context length 3

Show their predictions side by side.

For example:

Input:
"I like"

Context 1:
pizza 30%
cats 20%
...

Context 2:
programming 60%
coffee 20%
...

This should demonstrate why longer context changes predictions.

## Design

Use a clean modern academic/educational visual style.

Do not make it look like a commercial AI chatbot.

The interface should communicate a sequence of learning steps.

Use cards or panels for the major stages:

1. Training text
2. Tokenization
3. Model
4. Explore patterns
5. Prediction
6. Generation
7. Explanation

Use subtle visual distinctions for:

- input data
- model/context
- probabilities
- selected token

Avoid excessive animations.

The probability distributions and generation process should be the visual focus.

Use accessible typography, sufficient contrast, and clear labels.

## Architecture

Keep model logic separate from React UI components.

Suggested structure:

src/
components/
TrainingText.tsx
TokenViewer.tsx
ModelSettings.tsx
PatternExplorer.tsx
PredictionPanel.tsx
ProbabilityChart.tsx
TextGenerator.tsx
GenerationHistory.tsx
Explanation.tsx

model/
tokenize.ts
ngramModel.ts
probability.ts
sampling.ts

data/
examples.ts

types/
index.ts

Add unit-testable pure functions for:

- tokenization
- n-gram construction
- prediction
- probability calculation
- temperature transformation
- weighted sampling

## N-gram implementation

Implement a real n-gram model rather than hardcoded examples.

For context length N:

- read the token sequence
- construct a map from N-token contexts to possible next tokens
- count each occurrence
- calculate probability as:

count(next token after context)
/
total occurrences of context

Example training text:

Mari läks kooli.
Mari läks koju.
Mari läks kooli.
Mari läks poodi.

For:

Mari läks

the model should produce:

kooli: 2 / 4 = 50%
koju: 1 / 4 = 25%
poodi: 1 / 4 = 25%

## Temperature

Implement proper temperature scaling.

Start from token probabilities or logits derived from the probabilities.

The transformed distribution should behave approximately as follows:

temperature < 1
more probability concentrated on likely tokens

temperature = 1
original distribution

temperature > 1
distribution becomes flatter

Normalize probabilities after transformation.

Make sure the visualization updates immediately when the temperature slider changes.

## Randomness

For weighted sampling, use the browser's random number generator.

Do not fix a random seed by default.

Provide an optional "Repeatable experiment" mode if easy to implement, but it is not required for the initial version.

## Important pedagogical requirements

The application should help students discover, rather than merely read about, the following ideas:

- language models predict one token at a time
- predictions depend on previous context
- the same context may have several possible next tokens
- the output is a probability distribution, not a single predetermined answer
- generation can contain randomness
- temperature changes the output distribution
- longer context can change prediction
- a model can only learn patterns present in its training data
- generated text may be grammatically plausible without representing knowledge or truth
- repeated next-token prediction can produce surprisingly complex-looking text

Do not hide the intermediate steps from the student.

Whenever possible, expose the counts, contexts and probability calculations used by the model.

## README

Create a clear README.md explaining:

- purpose of the application
- educational goals
- how the n-gram model works
- difference between this model and an LLM
- installation
- development
- production build
- GitHub Pages deployment
- project structure

Also include a short section:

"Suggested classroom activity"

Example activity:

1. Paste a short text into the training area.
2. Test several starting phrases.
3. Compare context lengths 1, 2 and 3.
4. Generate text using greedy selection.
5. Switch to weighted sampling.
6. Increase the temperature.
7. Discuss why the results change.
8. Replace the training data with a very different text and repeat the experiment.

## Final quality requirements

Before considering the implementation complete:

- test with both English and Estonian text
- ensure Unicode text works correctly
- verify all probabilities sum to approximately 100%
- verify generation works for all three context lengths
- verify temperature actually changes the distribution
- ensure the application works without any backend
- ensure a production build succeeds
- ensure GitHub Pages deployment configuration is included
- keep the code readable and suitable for students to inspect

Prioritize educational clarity over feature complexity.
