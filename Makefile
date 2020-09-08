install: install-deps

run:
	DEBUG=page-loader* node bin/index.js http://sea-ea.surge.sh

install-deps:
	npm ci

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

publish:
	npm publish --dry-run

del:
	rm -rf sea-ea-surge-sh_files
	rm sea-ea-surge-sh.html


.PHONY: test
