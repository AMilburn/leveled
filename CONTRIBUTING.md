# Contributing to Leveled

Thank you for your interest in contributing to Leveled! This document provides guidelines and instructions for contributing.

## How to Contribute

### Reporting Bugs
- Search existing issues first to avoid duplicates
- Include a clear description of the bug and steps to reproduce
- Share screenshots or videos if relevant

### Suggesting Features
- Open an issue with the feature idea
- Explain the use case and why it would be valuable
- Be open to discussion about implementation approach

### Code Contributions

1. **Fork and clone** the repository
2. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and test locally:
   ```bash
   npm install
   npm run dev
   ```
4. **Commit** with clear messages
5. **Push to your fork** and open a **pull request**

## Development Setup

```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
npm run type-check  # Run TypeScript checks
```

## Code Style

- Write TypeScript with clear types
- Use existing component patterns in `src/components/`
- Keep components focused and reusable
- Add comments for non-obvious logic

## What to Expect

- I'll review PRs within a few days
- Changes will be evaluated based on:
  - Alignment with Leveled's core mission (RPG-style progression for developers)
  - Code quality and maintainability
  - Test coverage where applicable
- Be constructive in discussions—feedback is about code, not people

## License

By contributing, you agree your code will be licensed under the MIT License.
