# Quick Fix Reference Card

## 🚨 Common Error Patterns & Solutions

### Grid Component Errors

| Error | Fix |
|-------|-----|
| `Property 'item' does not exist` | Remove `item` prop: `<Grid size={{xs: 12}}>` |
| `No overload matches this call` | Remove `component` prop from Grid items |
| `xs/sm/md props deprecated` | Use `size` prop: `size={{xs: 12, sm: 6}}` |

### TypeScript Errors

| Error | Fix |
|-------|-----|
| `'X' is assigned but never used` | Remove variable or prefix with `_` |
| `Missing dependency in useCallback` | Add all referenced variables to dependency array |
| `Property 'X' does not exist on type 'Y'` | Add property to interface or use optional chaining |

### Import Errors

| Error | Fix |
|-------|-----|
| `'Component' is defined but never used` | Remove unused import |
| `Cannot find module` | Check import path and ensure file exists |
| `No exported member 'Grid2'` | Use `Grid` instead (Grid2 not available in this MUI version) |

## 🔧 Quick Commands

```bash
# Check TypeScript errors only
npx tsc --noEmit

# Run linting with fixes
npm run lint -- --fix

# Full build (includes all checks)
npm run build

# Fix Grid v7 migration automatically
npx @mui/codemod@next v7.0.0/grid-props src/

# Remove backup files after codemod
find src -name "*.bak" -delete
```

## 📋 Pre-commit Checklist

- [ ] `npm run build` passes without errors
- [ ] No unused imports or variables
- [ ] All useCallback/useEffect have correct dependencies
- [ ] Grid components use new v7 syntax
- [ ] Component interfaces are properly typed
- [ ] Event handlers have proper TypeScript types

## 🎯 Grid Migration Cheat Sheet

```tsx
// OLD (v5/v6) ❌
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    Content
  </Grid>
</Grid>

// NEW (v7) ✅  
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    Content
  </Grid>
</Grid>
```

## 🚀 Emergency Fix Workflow

1. **Build fails?** → `npx tsc --noEmit` to see TypeScript errors
2. **Grid errors?** → Run the codemod: `npx @mui/codemod@next v7.0.0/grid-props src/`
3. **Import errors?** → Remove unused imports, check paths
4. **Hook warnings?** → Add missing dependencies to useCallback/useEffect
5. **Test again** → `npm run build`

Keep this handy for quick reference! 🔖
