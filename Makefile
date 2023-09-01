.PHONY: help
help:
	@cat README.md

.PHONY: setup
setup:
	brew bundle
	pnpm install --frozen-lockfile

.PHONY: preview preview-book preview-presentation
preview:
	$(MAKE) -j $(shell nproc) preview-book preview-presentation

preview-book:
	mdbook serve

preview-presentation:
	pnpm marp --watch

book: $(shell find presentation src -type f)
	mdbook build
	pnpm marp
