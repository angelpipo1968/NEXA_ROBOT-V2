#!/bin/bash
# deploy-supabase.sh

echo "🚀 Desplegando Nexa AI con Supabase"

# 1. Instalar dependencias
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 3. Ejecutar SQL de inicialización
echo "📦 Ejecutando esquema de base de datos..."
# Copia el archivo SQL a Supabase
curl -X POST "https://api.supabase.com/v1/projects/{project-id}/sql" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "@supabase/schema.sql"

# 4. Configurar almacenamiento
echo "💾 Configurando buckets de storage..."
curl -X POST "https://api.supabase.com/v1/projects/{project-id}/storage/buckets" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"documents","public":false}'

curl -X POST "https://api.supabase.com/v1/projects/{project-id}/storage/buckets" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"avatars","public":true}'

# 5. Configurar políticas de storage
curl -X POST "https://api.supabase.com/v1/projects/{project-id}/storage/buckets/documents/policies" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Users can upload documents",
      "definition": "user_id() = owner",
      "action": "INSERT"
    },
    {
      "name": "Users can view own documents",
      "definition": "user_id() = owner",
      "action": "SELECT"
    }
  ]'

# 6. Construir aplicación
npm run build

# 7. Desplegar
npm run deploy

echo "✅ Despliegue completado!"
echo ""
echo "🌐 URL Frontend: https://tudominio.com"
echo "🔗 URL Supabase: https://app.supabase.com/project/{project-id}"
echo "🗄️  Database: PostgreSQL + pgvector"
echo "👤 Auth: Usuarios y sesiones"
echo "💾 Storage: Documentos y archivos"
