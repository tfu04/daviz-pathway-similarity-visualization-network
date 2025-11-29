# Contributing to Disease Network Visualization

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/tfu04/pathway_similarity_visualization_network.git
   cd pathway_similarity_visualization_network
   ```

2. **Set up development environment**
   - Follow the Quick Start guide in README.md
   - Ensure both backend and frontend run successfully

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Backend Development

1. Make changes to Python files in `backend/`
2. Test with: `uvicorn main:app --reload`
3. Verify endpoints at http://localhost:8000/docs
4. Run tests (if available): `pytest`

### Frontend Development

1. Make changes to React components in `frontend/src/`
2. Test with: `npm run dev`
3. Check browser console for errors
4. Verify changes at http://localhost:3000

## Code Style

### Python (Backend)

- Follow PEP 8 guidelines
- Use type hints where possible
- Format with `black`:
  ```bash
  black backend/
  ```

### JavaScript (Frontend)

- Follow ESLint rules
- Use functional components and hooks
- Run linter:
  ```bash
  npm run lint
  ```

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add weight percentile quick filters
fix: Resolve edge selection highlighting issue
docs: Update API endpoint documentation
refactor: Simplify network data processing
```

Prefix types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

## Pull Request Process

1. **Update documentation** if you've changed APIs or features
2. **Test thoroughly** - both backend and frontend
3. **Create pull request** with:
   - Clear title describing the change
   - Detailed description of what and why
   - Screenshots for UI changes
   - Reference any related issues

4. **Wait for review** - maintainers will review and provide feedback

## Reporting Issues

When reporting bugs, please include:

- **Environment**: OS, Python version, Node version
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console logs**: Any error messages

## Feature Requests

For feature suggestions:

- Check existing issues first
- Describe the problem you're trying to solve
- Propose a solution if you have one
- Explain how it benefits users

## Areas for Contribution

### Backend
- [ ] Additional filtering options
- [ ] Export endpoints (GraphML, CSV)
- [ ] Caching layer for performance
- [ ] Additional statistics endpoints
- [ ] Integration with external databases

### Frontend
- [ ] Advanced search filters
- [ ] Network comparison tools
- [ ] User annotations/notes
- [ ] Collaborative features
- [ ] Mobile app version

### Documentation
- [ ] Video tutorials
- [ ] API usage examples
- [ ] Deployment guides
- [ ] Troubleshooting guides

### Testing
- [ ] Backend unit tests
- [ ] Frontend component tests
- [ ] Integration tests
- [ ] Performance benchmarks

## Code Review Guidelines

When reviewing pull requests:

- Be respectful and constructive
- Test the changes locally
- Check for edge cases
- Verify documentation is updated
- Ensure code style is consistent

## Questions?

- Open an issue for discussion
- Check existing documentation
- Review closed issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for helping improve this project! 🎉
