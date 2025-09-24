# Documentation

This folder contains development guides and references for the Jarvis AI project.

## 📚 Available Guides

### [MUI V7 Guide](./MUI_V7_GUIDE.md)
Comprehensive guide for working with Material-UI v7, including:
- Grid component migration from v5/v6 to v7
- TypeScript patterns and best practices
- Common error solutions
- Component typing examples

### [Quick Fix Reference](./QUICK_FIX_REFERENCE.md)
Quick reference card for common errors and their solutions:
- Grid component errors
- TypeScript errors
- Import issues
- Emergency fix workflow

## 🛠️ Development Setup

The project includes VS Code settings (`.vscode/settings.json`) that automatically:
- Organize imports on save
- Fix ESLint issues on save
- Format code on save
- Enable TypeScript hints and suggestions

## 🚀 Quick Start

Before coding, familiarize yourself with:

1. **Grid Components**: Use the new MUI v7 syntax
2. **TypeScript**: Properly type all components and hooks
3. **Imports**: Only import what you use
4. **Dependencies**: Include all dependencies in useCallback/useEffect

## 🔧 Useful Commands

```bash
# Check for issues before committing
npm run build

# Fix auto-fixable linting issues
npm run lint -- --fix

# Check TypeScript without building
npx tsc --noEmit

# Migrate Grid components to v7
npx @mui/codemod@next v7.0.0/grid-props src/
```

## 📋 Pre-commit Workflow

1. Run `npm run build` to check for errors
2. Fix any TypeScript or linting issues
3. Test your changes work correctly
4. Commit and push

## 🆘 Need Help?

1. Check the [Quick Fix Reference](./QUICK_FIX_REFERENCE.md) for common errors
2. Review the [MUI V7 Guide](./MUI_V7_GUIDE.md) for detailed patterns
3. Run the emergency fix workflow if the build is broken

---

Keep this documentation updated as the project evolves! 📖
