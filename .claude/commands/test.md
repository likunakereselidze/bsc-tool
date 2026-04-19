Run the test suite for the BSC app.

## Commands

```bash
# Run all tests once
npm test

# Watch mode during development
npm run test:watch

# With coverage report
npm run test:coverage

# Run specific test file
npx vitest run tests/auth.test.ts

# Run tests matching a pattern
npx vitest run --reporter=verbose -t "canWriteObjective"
```

## On failure

Spawn parallel agents per failing test file. Each agent should:
1. Read the test file and the source file it tests
2. Identify whether the failure is in the test or the source
3. Fix the issue and verify with `npx vitest run <file>`
