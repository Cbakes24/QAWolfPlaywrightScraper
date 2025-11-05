# Testing Commands Reference

## Unit Tests (Mocha)

### Run all unit tests
```bash
npm test
```
Runs all Mocha tests in the `specs/` directory. Tests the helper functions:
- `timeFix()` - Converts ISO strings + Unix timestamps to JavaScript Date objects
- `currentArticlesSort()` - Validates articles are sorted newest to oldest
- `nullArticlesTest()` - Checks for null/undefined timestamps

### Run specific test file
```bash
npx mocha specs/helperFunctions.test.js
```

### Run tests with watch mode
```bash
npx mocha specs/**/*.js --watch
```

## E2E Tests (Playwright)

### Run all Playwright tests
```bash
npm run playwright tests
```
Runs Playwright tests across all configured browsers and devices:
- Desktop Chrome
- Desktop Firefox
- Desktop Safari (WebKit)
- Mobile Safari (iPhone 13 & iPhone 12)
- Microsoft Edge
- Google Chrome

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Safari"
```

### Run specific test file
```bash
npx playwright test tests/example.spec.ts
```

### Run tests in headed mode (visible browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Run tests with UI mode
```bash
npx playwright test --ui
```

### Run tests and show report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

### Run tests in a specific file
```bash
npx playwright test tests/example.spec.ts -g "articles sorted"
```

## Integration Tests (Scraper Scripts)

### Run main scraper (with comments)
```bash
node index.js
```
- Validates first 100 articles are sorted newest to oldest
- Sorts per page (early validation)
- Creates `HackerNewsArticles.json`

### Run clean scraper (no comments)
```bash
node noNotesIndex.js
```
- Collects all 100 articles first, then validates sorting
- Simpler approach, potentially faster

### Run scraper with logging
```bash
node testIndex.js
```
- Uses Winston logger
- Logs to console and `scraper.log` file
- Best for debugging and monitoring

## Test Utilities

### Install Playwright browsers
```bash
npx playwright install
```

### Install specific browser
```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### Show test report
```bash
npx playwright show-report
```

### Generate code from browser actions
```bash
npx playwright codegen https://news.ycombinator.com/newest
```

## Test Coverage

### Available Test Suites

1. **Unit Tests** (`specs/helperFunctions.test.js`)
   - Tests helper function logic
   - Fast execution
   - No browser required

2. **E2E Tests** (`tests/example.spec.ts`)
   - `find articles` - Validates page loads and articles are found
   - `check for any articles with null or undefined timestamps` - Validates data integrity
   - `articles sorted by date` - Validates first 100 articles are sorted newest to oldest

3. **Integration Tests** (Scraper scripts)
   - Full end-to-end scraping workflow
   - Validates sorting across multiple pages
   - Creates JSON output files

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run Mocha unit tests |
| `npm run playwright` | Run Playwright E2E tests |
| `node index.js` | Run main scraper |
| `node testIndex.js` | Run scraper with logging |
| `npx playwright test --ui` | Run tests with UI mode |
| `npx playwright test --debug` | Run tests with UI mode |
| `npx playwright show-report` | View test report |
