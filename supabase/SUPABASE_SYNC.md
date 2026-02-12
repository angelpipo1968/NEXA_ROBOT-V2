# Supabase Synchronization Guide

Since the Supabase CLI is not installed in this environment, follow these steps to manually synchronize your database schema and internal functions.

## Step 1: Copy the Consolidated Schema
Open the file [FULL_SCHEMA.sql](file:///c:/nexa/supabase/FULL_SCHEMA.sql) and copy its entire content.

## Step 2: Paste into Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://app.supabase.com/).
2. Select your project.
3. Click on the **SQL Editor** tab in the left sidebar.
4. Click on **New Query**.
5. Paste the content of `FULL_SCHEMA.sql`.
6. Click **Run**.

## Step 3: Verify Tables and Functions
Ensure the following items were created/updated:
- **Tables**: `profiles`, `memories`, `conversations`, `messages`.
- **Functions**: `match_memories` (found under Database > Functions).
- **Triggers**: `on_auth_user_created` (found under Database > Triggers).

## Why manual sync?
Nexa OS is designed to be lightweight. By using the SQL Editor directly, you avoid the complexity of installing Docker and the Supabase CLI, which are typically required for professional local development but unnecessary for rapid deployment of this system.

> [!TIP]
> Each time you make changes to the schema in the future, it's recommended to update `FULL_SCHEMA.sql` and repeat this process.
