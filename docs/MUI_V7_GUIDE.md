# Material-UI v7 Development Guide

This guide helps prevent common TypeScript and linting issues when working with Material-UI v7 in the Jarvis project.

## Table of Contents
- [Grid Component Migration](#grid-component-migration)
- [Common TypeScript Patterns](#common-typescript-patterns)
- [Linting Best Practices](#linting-best-practices)
- [Troubleshooting](#troubleshooting)

## Grid Component Migration

### ✅ Correct MUI v7 Grid Usage

```tsx
// ✅ CORRECT - New Grid v7 syntax
import { Grid } from '@mui/material';

// Container
<Grid container spacing={2}>
  {/* Items with new size prop format */}
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Paper>Content here</Paper>
  </Grid>
  
  <Grid size={{ xs: 12, md: 8 }}>
    <Paper>Content here</Paper>
  </Grid>
  
  {/* Single size for all breakpoints */}
  <Grid size={6}>
    <Paper>Half width</Paper>
  </Grid>
  
  {/* Grow to fill space */}
  <Grid size="grow">
    <Paper>Flexible content</Paper>
  </Grid>
</Grid>
```

### ❌ Deprecated/Incorrect Usage

```tsx
// ❌ WRONG - Old Grid syntax (causes TypeScript errors)
import { Grid } from '@mui/material';

<Grid container spacing={2}>
  {/* DON'T USE: item prop is deprecated */}
  <Grid item xs={12} sm={6} md={4}>
    <Paper>Content</Paper>
  </Grid>
  
  {/* DON'T USE: component prop with item */}
  <Grid item component="div" xs={12}>
    <Paper>Content</Paper>
  </Grid>
</Grid>
```

### Migration Steps

1. **Remove `item` prop** from all Grid components
2. **Convert size props** to new format:
   ```tsx
   // Before
   <Grid item xs={12} sm={6} md={4}>
   
   // After
   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
   ```

3. **Use the official codemod** for bulk conversions:
   ```bash
   npx @mui/codemod@next v7.0.0/grid-props src/
   ```

## Common TypeScript Patterns

### Event Handlers with Proper Typing

```tsx
// ✅ CORRECT - Properly typed event handlers
import { SelectChangeEvent } from '@mui/material';

const handleSelectChange = (event: SelectChangeEvent<string>) => {
  const value = event.target.value;
  // TypeScript knows value is string
};

const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;
  // Properly typed input change
};
```

### Component Props with TypeScript

```tsx
// ✅ CORRECT - Interface for component props
interface CustomCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const CustomCard: React.FC<CustomCardProps> = ({ 
  title, 
  description, 
  onClick, 
  children 
}) => {
  return (
    <Card onClick={onClick}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2">{description}</Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
};
```

### Styled Components

```tsx
// ✅ CORRECT - Properly typed styled components
import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

interface StyledPaperProps {
  highlighted?: boolean;
}

const StyledPaper = styled(Paper)<StyledPaperProps>(({ theme, highlighted }) => ({
  padding: theme.spacing(2),
  backgroundColor: highlighted ? theme.palette.primary.light : 'inherit',
  transition: theme.transitions.create(['backgroundColor']),
}));
```

## Linting Best Practices

### Import Organization

```tsx
// ✅ CORRECT - Import order and grouping
// 1. React imports
import React, { useState, useEffect, useCallback } from 'react';

// 2. Next.js imports
import { useRouter } from 'next/navigation';

// 3. MUI imports (grouped)
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

// 4. Local imports
import { AuthGate } from '@/components/AuthGate';
import { useConversationTracking } from '@/hooks/useConversationTracking';
```

### Unused Imports and Variables

```tsx
// ❌ WRONG - Unused imports cause linting errors
import { Paper, Grid, Box } from '@mui/material'; // Paper not used
import Link from 'next/link'; // Link not used

// ✅ CORRECT - Only import what you use
import { Grid, Box } from '@mui/material';
```

### Proper Hook Dependencies

```tsx
// ✅ CORRECT - All dependencies included
const loadData = useCallback(async () => {
  const response = await fetch(`/api/data/${userId}`);
  const data = await response.json();
  setData(data);
}, [userId]); // userId is included in dependencies

useEffect(() => {
  loadData();
}, [loadData]); // loadData is included
```

## Troubleshooting

### Common Error: "Property 'item' does not exist"

**Error Message:**
```
Property 'item' does not exist on type 'IntrinsicAttributes & GridBaseProps'
```

**Solution:**
```tsx
// ❌ Causing error
<Grid item xs={12}>

// ✅ Fixed
<Grid size={{ xs: 12 }}>
```

### Common Error: "No overload matches this call"

**Error Message:**
```
No overload matches this call for Grid component
```

**Solution:**
Remove `component` prop when using with size props:
```tsx
// ❌ Causing error
<Grid item component="div" xs={12}>

// ✅ Fixed
<Grid size={{ xs: 12 }}>
```

### Common Error: Missing Hook Dependencies

**Error Message:**
```
React Hook useCallback has a missing dependency
```

**Solution:**
```tsx
// ❌ Missing dependency
const handleClick = useCallback(() => {
  doSomething(externalVar);
}, []); // externalVar not in deps

// ✅ Fixed
const handleClick = useCallback(() => {
  doSomething(externalVar);
}, [externalVar]); // Include all dependencies
```

### Common Error: Unused Variables

**Error Message:**
```
'variableName' is assigned a value but never used
```

**Solutions:**
```tsx
// Option 1: Remove unused variable
// const unused = getValue(); // Remove this line

// Option 2: Comment out if needed later
// const maybeNeeded = getValue();

// Option 3: Use underscore prefix for intentionally unused
const _metadata = response.metadata; // Won't trigger warning
```

## Quick Reference Commands

### Check for TypeScript Errors
```bash
npx tsc --noEmit
```

### Run Linting
```bash
npm run lint
```

### Fix Auto-fixable Linting Issues
```bash
npm run lint -- --fix
```

### Run MUI Migration Codemod
```bash
npx @mui/codemod@next v7.0.0/grid-props src/
```

### Build Project (includes linting and type checking)
```bash
npm run build
```

## File Structure Best Practices

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   └── specific/        # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
└── app/                 # Next.js app directory
    ├── api/            # API routes
    └── (routes)/       # Page components
```

## Type Definition Patterns

### Create Dedicated Types File

```tsx
// types/mui.ts
export interface GridItemProps {
  size?: 
    | number 
    | "grow" 
    | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number | "grow">>;
  children: React.ReactNode;
}

export interface CommonCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
}
```

### Use Consistent Naming Conventions

```tsx
// Component interfaces end with Props
interface UserMenuProps { }
interface SettingsPageProps { }

// API response types end with Response  
interface UserResponse { }
interface ConversationResponse { }

// Data models use descriptive names
interface User { }
interface Conversation { }
interface UsageMetrics { }
```

---

## Summary

Following this guide will help you:
- ✅ Avoid Grid component TypeScript errors
- ✅ Write properly typed MUI components
- ✅ Pass all linting checks
- ✅ Maintain consistent code quality
- ✅ Handle MUI v7 migration smoothly

Remember to run `npm run build` frequently to catch issues early in development!
