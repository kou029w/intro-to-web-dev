.PHONY: help
help:
	@cat README.md

.PHONY: preview
preview:
	mdbook serve

book: $(shell find src examples -type f -not -path '*/node_modules/*')
	mdbook build
	rsync -a --exclude node_modules --exclude '*.test.js' examples/ book/examples/
	for f in src/web-ai/_*.md; do \
		npx -y @marp-team/marp-cli --theme-set src/web-ai/theme.css --html --output book/web-ai/$$(basename $$f .md).html $$f; \
	done

# スライドの一部を、教材ページの挿絵として src/web-ai/assets/slides/ に書き出す
.PHONY: slide-images
slide-images:
	node scripts/slide-images.mjs
