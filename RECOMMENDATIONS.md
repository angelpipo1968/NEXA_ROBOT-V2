# Nexa System Optimization & Update Recommendations

## 1. GitHub & Version Control
- **Authentication**: The current Git credentials for `origin` seem to be expired or invalid. Please update your Personal Access Token (PAT) or use SSH keys.
- **Branch Strategy**: Currently working on `prod-v7`. Recommended to merge this into `main` after verification.
- **Pre-commit Hooks**: Husky hooks are failing on Windows. Consider using cross-platform scripts or disabling them locally if not needed.

## 2. Vercel deployment
- **Caching**: Add `headers` configuration in `vercel.json` to cache static assets in `/assets` for 1 year (immutable). This significantly improves load performance.
- **Analytics**: Enable Vercel Analytics and Speed Insights in your project dashboard to track real-user performance.
- **Environment Variables**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel project settings.

## 3. Supabase Database
- **Indexing**: Check if query performance is slow. Add indexes on `messages(user_id, created_at)` and `memories(user_id, embedding)` for faster retrieval.
- **RLS Policies**: Review Row Level Security (RLS) policies to ensure only authenticated users can access their own data.
- **Backups**: Enable Point-in-Time Recovery (PITR) if not already active for production data safety.

## 4. Codebase Optimization
- **Lazy Loading**: Use `React.lazy` and `Suspense` for heavy routes (e.g., Image Generator, settings modal) to reduce initial bundle size.
- **State Management**: split `useChatStore` into smaller slices (`useMessageStore`, `useUISettings`) to prevent unnecessary re-renders when updating simple flags.
- **Voice Performance**: Move speech synthesis logic to a Web Worker to avoid freezing the UI during long text processing.
- **Dependencies**: 
    - `axios` has a vulnerability. Run `npm update axios`.
    - `glob` is deprecated. Consider alternatives or update consuming packages.

## 5. Security
- **API Keys**: Ensure no API keys are hardcoded. Use `.env` files exclusively.
- **Dependencies**: Regularly run `npm audit` and fix high-severity vulnerabilities.
