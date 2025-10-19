# Contributing to ChitChat 🤝

Thank you for your interest in contributing to ChitChat! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ChitChat.git
   cd ChitChat
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up environment** (see README.md for Firebase setup)
5. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 🛠️ Development Guidelines

### **Code Style**
- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **functional components** with hooks
- Add **JSDoc comments** for complex functions
- Follow **mobile-first** responsive design

### **Naming Conventions**
```typescript
// Components: PascalCase
const ChatWindow = () => {}

// Files: kebab-case
chat-window.tsx
use-presence.ts

// Functions: camelCase
const handleSendMessage = () => {}

// Constants: UPPER_SNAKE_CASE
const FIREBASE_COLLECTIONS = {}
```

### **Component Structure**
```typescript
"use client" // If needed

import type React from "react"
import { useState, useEffect } from "react"

interface ComponentProps {
  // Props definition
}

export default function Component({ prop }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState()
  
  // Event handlers
  const handleClick = () => {}
  
  // Effects
  useEffect(() => {}, [])
  
  // Early returns
  if (loading) return <Loading />
  
  // Main render
  return <div>Content</div>
}
```

## 📋 Types of Contributions

### 🐛 **Bug Fixes**
- Fix existing functionality
- Add error handling
- Improve performance
- Fix responsive design issues

### ✨ **New Features**
- Real-time features (presence, notifications)
- UI/UX improvements
- Chat enhancements (reactions, file sharing)
- Accessibility improvements

### 📖 **Documentation**
- README improvements
- Code comments
- API documentation
- Setup guides

### 🧪 **Testing**
- Unit tests for components
- Integration tests for features
- E2E tests for user flows
- Performance testing

## 🎯 Priority Areas

We're especially looking for help with:

1. **Accessibility** - ARIA labels, keyboard navigation
2. **Testing** - Unit and integration tests
3. **Performance** - Optimization and caching
4. **Mobile Experience** - iOS/Android specific improvements
5. **Real-time Features** - Notifications, file sharing
6. **Documentation** - Tutorials and guides

## 🔧 Technical Requirements

### **Firebase Integration**
- Use existing Firebase hooks and utilities
- Follow Firestore security rules
- Implement proper error handling
- Use TypeScript types from `firestore-schema.ts`

### **State Management**
- Use React hooks for local state
- Use Firebase for server state
- Implement optimistic updates
- Handle loading and error states

### **Responsive Design**
- Mobile-first approach
- Test on multiple screen sizes
- Use Tailwind CSS classes
- Ensure touch-friendly interfaces

## 🚦 Pull Request Process

### **Before Submitting**
1. ✅ **Test locally** - Ensure your changes work
2. ✅ **Run linting** - `pnpm lint`
3. ✅ **Check types** - `pnpm type-check`
4. ✅ **Build successfully** - `pnpm build`
5. ✅ **Test mobile** - Check responsive design

### **PR Requirements**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tested locally
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Firebase integration works

## Screenshots (if applicable)
Before/after screenshots for UI changes
```

### **Review Process**
1. **Automated checks** must pass
2. **Manual review** by maintainers
3. **Testing** on different devices
4. **Merge** after approval

## 🐛 Bug Reports

### **Before Reporting**
- Check existing issues
- Test in incognito/private mode
- Try different browsers/devices

### **Bug Report Template**
```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10, macOS, iOS]
- Browser: [e.g., Chrome 91, Safari 14]
- Device: [e.g., iPhone 12, Desktop]
- Screen size: [e.g., 375x812, 1920x1080]

## Screenshots
If applicable, add screenshots
```

## 💡 Feature Requests

### **Feature Request Template**
```markdown
## Feature Description
Clear description of the proposed feature

## Problem Solved
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
Other ways to solve this

## Additional Context
Mockups, examples, etc.
```

## 🏗️ Architecture Overview

### **Key Directories**
```
app/                    # Next.js App Router
├── globals.css        # Global styles
├── layout.tsx         # Root layout
└── page.tsx           # Main page

components/             # React components
├── auth/              # Authentication
├── chat/              # Chat features
├── providers/         # Context providers
└── ui/                # Reusable UI

hooks/                 # Custom hooks
lib/                   # Utilities
└── firebase.ts        # Firebase config
```

### **Data Flow**
1. **Authentication** → AuthProvider → Components
2. **Real-time Data** → Firebase listeners → State updates
3. **User Actions** → Event handlers → Firebase writes
4. **State Management** → React hooks + Firebase

## 🔒 Security Guidelines

- **Never commit** API keys or secrets
- **Validate inputs** on both client and server
- **Use Firebase Security Rules** for access control
- **Sanitize user content** before display
- **Follow OWASP** security best practices

## 📞 Getting Help

### **Questions?**
- 💬 **Discord**: [Join our community](#)
- 📧 **Email**: [maintainers@chitchat.com](#)
- 📋 **Issues**: GitHub Issues for bugs
- 💡 **Discussions**: GitHub Discussions for ideas

### **Resources**
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🙏 Recognition

All contributors will be:
- ✨ **Listed** in README.md
- 🏆 **Recognized** in release notes
- 💝 **Thanked** in our community

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for making ChitChat better! 🚀**