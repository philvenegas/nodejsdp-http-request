#   make format       # biome + wrap comments to lineWidth
#   make format-check # dry run: show what would change

.PHONY: format format-check

format:
	biome format --write .
	bun scripts/wrap-comments.ts --write

format-check:
	biome format .
	bun scripts/wrap-comments.ts
