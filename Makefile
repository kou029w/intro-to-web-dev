.PHONY: help
help:
	@cat README.md

.PHONY: preview
preview:
	mdbook serve

book: $(shell find src -type f)
	mdbook build
	for f in src/web-ai/_*.md; do \
		npx -y @marp-team/marp-cli --theme-set src/web-ai/theme.css --html --output book/web-ai/$$(basename $$f .md).html $$f; \
	done
