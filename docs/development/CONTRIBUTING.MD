# Contributing to SaleSpider

Thank you for your interest in contributing to SaleSpider! We appreciate your effort and want to make contributing as easy and transparent as possible.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to be respectful, inclusive, and professional in all interactions.

## Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots or logs if applicable

## Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear description of the enhancement
- The motivation/use case for the change
- Any implementation ideas you might have

## Development Process

1. **Fork the repository** and create your feature branch from `main`
2. **Install dependencies**: `npm install`
3. **Set up your development environment** following the [Local Setup Guide](/development/LOCAL-SETUP)
4. **Make your changes** with clear, focused commits
5. **Test your changes** thoroughly
6. **Run linting**: `npm run lint`
7. **Create a pull request** with a clear description

### Branch Naming

Use descriptive branch names:

- `feat/add-new-feature`
- `fix/resolve-bug-description`
- `docs/update-documentation`
- `refactor/improve-component`

### Commit Messages

Follow conventional commit format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests

Example: `feat: add dark mode toggle to settings page`

## Pull Request Guidelines

- Fill out the pull request template completely
- Link any related issues
- Ensure all tests pass
- Keep changes focused and atomic
- Update documentation if needed
- Add tests for new functionality

## Testing

- Write tests for new features and bug fixes
- Ensure existing tests continue to pass
- Test across different browsers and devices when applicable

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Code Style

We use ESLint and Prettier to maintain code quality:

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Documentation

- Update README.md if you change functionality
- Add comments for complex code sections
- Update API documentation for backend changes
- Keep documentation in sync with code changes

## Project Structure

See the [Project Structure](/development/STRUCTURE) page for a complete overview of the codebase organization.

## Definition of Done

Before submitting your PR, ensure:

- ✅ Code follows project conventions
- ✅ Tests are written and passing
- ✅ Documentation is updated
- ✅ No linting errors
- ✅ PR description is clear and complete
- ✅ All CI checks pass

## Areas for Contribution

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

### High Priority Areas

- Bug fixes and stability improvements
- Test coverage improvements
- Documentation enhancements
- Performance optimizations
- Accessibility improvements

### Feature Development

- Inventory management enhancements
- Sales analytics improvements
- AI feature expansions
- Mobile responsiveness
- Internationalization (i18n)

## Getting Help

If you need help:

- Check existing [documentation](/GETTING-STARTED)
- Look through existing issues and discussions
- Create a new issue with the "question" label
- Join our community discussions
- Contact us at [salespider2025@outlook.com](mailto:salespider2025@outlook.com)

## Development Tips

### Database Changes

When making database schema changes:

1. Update `prisma/schema.prisma`
2. Create a migration: `npx prisma migrate dev --name your_migration_name`
3. Update seed files if needed
4. Test migration on a fresh database

### Component Development

When creating new components:

1. Use TypeScript for type safety
2. Follow existing component patterns
3. Add proper prop types and documentation
4. Consider accessibility (ARIA labels, keyboard navigation)
5. Test responsive behavior

### API Development

When creating new API routes:

1. Follow RESTful conventions
2. Add proper error handling
3. Implement rate limiting where appropriate
4. Add input validation using Zod schemas
5. Document endpoints

## Review Process

1. **Automated Checks**: CI runs tests, linting, and type checking
2. **Code Review**: Maintainers review code quality and design
3. **Testing**: Reviewers test functionality
4. **Approval**: At least one maintainer approval required
5. **Merge**: Maintainers merge approved PRs

## Release Process

We follow semantic versioning (SemVer):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backwards compatible
- **Patch** (0.0.1): Bug fixes, backwards compatible

## License

By contributing to SaleSpider, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors are recognized in:

- GitHub contributors page
- Release notes for significant contributions
- Project README

---

Thank you for contributing to SaleSpider! Your efforts help make this project better for everyone.

## Related Documentation

- [Local Setup Guide](/development/LOCAL-SETUP)
- [Project Structure](/development/STRUCTURE)
- [Architecture Overview](/development/ARCHITECTURE)
