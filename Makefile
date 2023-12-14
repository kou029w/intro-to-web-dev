.PHONY: help
help:
	@cat README.md

.PHONY: setup
setup:
	brew bundle
	pnpm install --frozen-lockfile

.PHONY: preview preview-book
preview:
	$(MAKE) -j $(shell nproc) preview-book

preview-book:
	mdbook serve

book: $(shell find src -type f)
	mdbook build
