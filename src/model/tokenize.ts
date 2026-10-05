const TOKEN_PATTERN = /[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}]+)*|[^\s\p{L}\p{M}\p{N}]/gu

export function tokenize(text: string, ignoreCapitalization = false): string[] {
  const tokens = text.match(TOKEN_PATTERN) ?? []
  return ignoreCapitalization ? tokens.map((token) => token.toLocaleLowerCase()) : tokens
}

export function splitInput(text: string, ignoreCapitalization = false): string[] {
  return tokenize(text.trim(), ignoreCapitalization)
}
