---
description: Create a premium, pro-level React UI component
---
# Create UI Component Workflow

This workflow guides the AI in creating high-quality, modern React components utilizing the design system and best practices of Nexa OS.

1. Analyze the user's description and requirements for the component.
2. Ensure you review existing `ui-ux-pro-max` guidelines or `DESIGN.md` if available to match the aesthetic.
3. Identify if any `shadcn/ui` or Radix UI base components are suitable.
4. If using `shadcn/ui`, construct the component carefully.
    // turbo
    ```bash
    npx shadcn-ui@latest add [component-name]
    ```
5. Implement the actual component file (e.g., `src/components/ui/MyNewComponent.tsx`). Apply:
    - **Glassmorphism**: `bg-white/10 backdrop-blur-md border border-white/20`
    - **Micro-interactions**: Use `framer-motion` for smooth hover and entrance animations.
    - **Tailwind**: Consistent spacing and colors.
6. Write a simple Vitest unit test for the component (e.g., `MyNewComponent.test.tsx`) addressing rendering and core behavior.
    // turbo
    ```bash
    npx vitest run --environment jsdom
    ```
7. Verify the output is fully responsive and adheres to high-end premium web standards.
