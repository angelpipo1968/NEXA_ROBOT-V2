# 🚀 NEXA Deployment Checklist

## Antes de lanzar a producción

### 1. Variables de entorno en Vercel
Agregar en Vercel Project Settings → Environment Variables:

```
# Supabase (OBLIGATORIO)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini (OBLIGATORIO si usas IA)
VITE_GEMINI_API_KEY=AIzaSy...

# ElevenLabs (OPCIONAL, para síntesis de voz premium)
VITE_ELEVENLABS_API_KEY=sk_...

# Next.js si aplica
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Secretos parametrizados en Supabase

En Supabase Dashboard → Project Settings → Secrets:

```
GEMINI_API_KEY=AIzaSy...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (anon key)
```

### 3. Secretos en GitHub (para CI/CD)

En GitHub repo → Settings → Secrets and variables → Actions:

```
VERCEL_TOKEN=<token desde Vercel account>
VERCEL_ORG_ID=<org ID desde Vercel>
VERCEL_PROJECT_ID=<project ID desde Vercel>
SUPABASE_PROJECT_ID=<project-ref>
SUPABASE_ACCESS_TOKEN=<token con permisos db:push>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

### 4. Validar Supabase Schema

Antes de `supabase db push`:

```bash
# Verificar estado actual
npx supabase status

# Ver qué migraciones se ejecutarán
npx supabase db diff

# Aplicar cambios (desde repo con supabase/migrations)
npx supabase db push
```

**Validar que estas tablas existan:**
- ✅ `public.profiles`
- ✅ `public.memories` (con columna `embedding` tipo `vector(768)`)
- ✅ `public.conversations`
- ✅ `public.messages`
- ✅ `public.cognitive_cycles`

**Validar que estas funciones RPC existan:**
- ✅ `match_memories` (búsqueda semántica de vectores)

**Validar que estas funciones Edge existan:**
- ✅ `nexa-core` (proxy de Gemini)

### 5. Desplegar función Supabase

```bash
npx supabase functions deploy nexa-core \
  --project-ref $SUPABASE_PROJECT_ID
```

Verificar en Supabase Dashboard → Functions → nexa-core

### 6. Probar en preview antes de main

1. Crear rama feature: `git checkout -b feature/test-deployment`
2. Deploy a Vercel preview (automático)
3. Verificar que:
   - ✅ Página carga sin "DEMO MODE"
   - ✅ Chat con Gemini funciona (requiere `VITE_GEMINI_API_KEY`)
   - ✅ Voz responde (requiere browser con Web Speech API)
   - ✅ Memoria persiste en Supabase (check `memories` table)
4. Merge a `main` solo si todo funciona

### 7. Monitoreo post-despliegue

**En Vercel:**
- Revisar logs en Deployments
- Monitorear Function performance

**En Supabase:**
- Revisar `cognitive_cycles` para heartbeat exitosos
- Monitorear GPU usage de Edge Functions

---

## Troubleshooting

### "DEMO MODE ACTIVO"
**Causa:** Variables `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY` no configuradas.
**Solución:**
```bash
# En Vercel CLI local
vercel env pull

# O agregar manualmente en Vercel dashboard
```

### Migración falla con error SQL
**Causa:** Sintaxis inválida en `supabase/migrations/`
**Solución:**
```bash
# Validar migraciones
npx supabase db list migrations

# Si hay conflictos, resolver manualmente
npx supabase migration repair <migration-name>
```

### `nexa-core` retorna 500
**Causa:** `GEMINI_API_KEY` no configurada en Supabase Secrets.
**Solución:**
1. Ir a Supabase Dashboard → Project Settings → Secrets
2. Agregar `GEMINI_API_KEY=AIzaSy...`
3. Redeploy: `npx supabase functions deploy nexa-core`

### Memoria no se guarda
**Causa:** RLS policy bloqueando inserts, o `memories` table no existe.
**Solución:**
- Confirmar que `auth.uid()` matchea `user_id` en tabla
- Confirmar que usuario está autenticado (no demo user)
- Verificar columna schema: debe ser `user_id uuid`

---

## CI/CD Workflow

El archivo `.github/workflows/deploy.yml` ejecuta automáticamente:

1. **quality-checks** → Code style & tests
2. **build-and-deploy** → Build npm run build
3. **deploy-vercel** → Vercel deployment (requiere `VERCEL_TOKEN`)
4. **deploy-supabase** → Schema migration (requiere `SUPABASE_*`)

Solo se ejecutan en push a `main`.

Para test local:
```bash
npm run lint
npm run test -- --run
npm run build
```

---

## Escala y seguridad

- **Límite de memoria:** ~50k documents en `memories` antes de paginar búsquedas
- **Rate limiting:** Configurar en Supabase → Project Settings → Rate Limiting
- **RLS:** Ya habilitado; revisar policies en FULL_SCHEMA.sql
- **API Keys:** Almacenar SOLO en Supabase Secrets, NUNCA en código

---

Última revisión: 15 de Abril de 2026
