.PHONY: help
help:
	@cat README.md

.PHONY: preview
preview:
	mdbook serve

book: $(shell find src -type f)
	mdbook build
	npx -y @marp-team/marp-cli --input-dir src/training --theme-set src/training/theme.css --html --output book/training
