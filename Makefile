.PHONY: help
help:
	@cat README.md

.PHONY: preview
preview:
	mdbook serve

book: $(shell find src examples/prompt-api-* -type f -not -path '*/node_modules/*')
	mdbook build
	for d in examples/prompt-api-*/; do \
		mkdir -p book/$$d; \
		cp $$d*.html $$d*.js $$d*.css book/$$d; \
	done
	for f in src/web-ai/_*.md; do \
		npx -y @marp-team/marp-cli --theme-set src/web-ai/theme.css --html --output book/web-ai/$$(basename $$f .md).html $$f; \
	done
