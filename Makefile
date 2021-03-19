NAME=icarus
VENDOR_DIR=./vendor
LOCK=./lock.json
IMPORT_MAP=./import_map.json

BUILD_DIR=./build
RELEASE_DIR=./dist

ENTRY=./src/index.ts

DENO=DENO_DIR=$(VENDOR_DIR) deno
DENO_OPTIONS=--lock $(LOCK) --import-map $(IMPORT_MAP) --unstable

.PHONY: test compile run cache windows linux osx osx_arm clear fmt release

default: compile

test:
	$(DENO) test $(DENO_OPTIONS) --allow-all ./src/

run:
	$(DENO) run $(DENO_OPTIONS) --allow-all $(ENTRY)

clear:
	rm -rf $(BUILD_DIR)

compile: clear windows linux osx osx_arm

ENSURE_BUILD_DIR=mkdir -p $(BUILD_DIR)/$@

windows:
	$(ENSURE_BUILD_DIR)
	$(DENO) compile $(DENO_OPTIONS) --allow-all --target x86_64-pc-windows-msvc -o $(BUILD_DIR)/$@/$(NAME) $(ENTRY)

linux:
	$(ENSURE_BUILD_DIR)
	$(DENO) compile $(DENO_OPTIONS) --allow-all --target x86_64-unknown-linux-gnu -o $(BUILD_DIR)/$@/$(NAME) $(ENTRY)

osx:
	$(ENSURE_BUILD_DIR)
	$(DENO) compile $(DENO_OPTIONS) --allow-all --target x86_64-apple-darwin -o $(BUILD_DIR)/$@/$(NAME) $(ENTRY)

osx_arm:
	$(ENSURE_BUILD_DIR)
	$(DENO) compile $(DENO_OPTIONS) --allow-all --target aarch64-apple-darwin -o $(BUILD_DIR)/$@/$(NAME) $(ENTRY)

cache:
	$(DENO) cache $(DENO_OPTIONS) --lock-write $(ENTRY)

fmt:
	./scripts/fmt.sh

release: compile
	bash ./scripts/release.sh $(NAME) $(BUILD_DIR) $(RELEASE_DIR)