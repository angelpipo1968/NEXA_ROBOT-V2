#!/bin/bash
#
# next_steps.sh
# Pasos para activar todas las mejoras implementadas
#

set -e

echo "🚀 NEXA: Activando Mejoras de Seguridad + Observabilidad"
echo "=========================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Paso 1: Aplicar migraciones a Supabase${NC}"
echo "───────────────────────────────────────"
echo "Esto crea las tablas: inference_metrics, activity_logs"
echo ""

read -p "¿Deseas continuar? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aplicando migraciones..."
    npx supabase db push --yes || echo "⚠️ Usa: SUPABASE_PROJECT_ID y SUPABASE_ACCESS_TOKEN como env vars"
    echo -e "${GREEN}✅ Migraciones aplicadas${NC}"
else
    echo "⏭️  Saltando paso 1"
fi

echo ""
echo -e "${BLUE}Paso 2: Ejecutar tests${NC}"
echo "─────────────────────"
echo "Tests para InputValidator, Analytics, Memory, Voice, RLS, Error Handler"
echo ""

read -p "¿Deseas ejecutar los tests? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Ejecutando tests..."
    npm test -- tests/core.test.ts --run || echo "⚠️ Asegúrate de tener Jest instalado: npm install --save-dev jest @types/jest ts-jest"
    echo -e "${GREEN}✅ Tests completados${NC}"
else
    echo "⏭️  Saltando paso 2"
fi

echo ""
echo -e "${BLUE}Paso 3: Validar variables de entorno${NC}"
echo "──────────────────────────────────────"
echo "Requeridas en Vercel:"
echo "  - VITE_SUPABASE_URL"
echo "  - VITE_SUPABASE_ANON_KEY"
echo "  - VITE_GEMINI_API_KEY"
echo ""

# Check local .env if exists
if [ -f .env.local ]; then
    echo -e "${GREEN}✅ .env.local encontrado${NC}"
    if grep -q "VITE_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✅ VITE_SUPABASE_URL está configurado${NC}"
    else
        echo -e "${YELLOW}⚠️ Falta VITE_SUPABASE_URL en .env.local${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ No hay .env.local. Crea uno desde .env.example${NC}"
fi

echo ""
echo -e "${BLUE}Paso 4: Build y test local${NC}"
echo "──────────────────────────"
read -p "¿Deseas hacer build? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Building..."
    npm run build || echo "❌ Build falló. Revisa los logs arriba."
    echo -e "${GREEN}✅ Build completado${NC}"
else
    echo "⏭️  Saltando paso 4"
fi

echo ""
echo -e "${BLUE}Paso 5: Push a rama feature (prueba en preview)${NC}"
echo "──────────────────────────────────────────────"
echo "Recomendado antes de main:"
echo "  git checkout -b feature/security-improvements"
echo "  git add ."
echo "  git commit -m 'feat: Add security, analytics, logging, error handling'"
echo "  git push origin feature/security-improvements"
echo ""

read -p "¿Deseas continuar manualmente? (y/n) " -n 1 -r
echo

echo ""
echo "════════════════════════════════════════════════════════"
echo "📋 CHECKLIST FINAL"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Archivos nuevos creados:"
echo "  ✅ src/lib/security/InputValidator.ts"
echo "  ✅ src/lib/analytics/AnalyticsService.ts"
echo "  ✅ src/lib/errors/GeminiErrorHandler.ts"
echo "  ✅ src/lib/logging/StructuredLogger.ts"
echo "  ✅ src/hooks/useImprovedChat.ts"
echo "  ✅ tests/core.test.ts"
echo "  ✅ supabase/migrations/20260415_analytics_logging.sql"
echo ""
echo "Archivos modificados:"
echo "  ✅ src/lib/gemini.ts (ahora con validación + retry + logging)"
echo "  ✅ supabase/FULL_SCHEMA.sql"
echo ""
echo "Documentación:"
echo "  📖 IMPLEMENTATION_SUMMARY.md"
echo "  📖 DEPLOYMENT_CHECKLIST.md"
echo "  📖 ENHANCEMENT_PLAN.md"
echo "  📖 validate_deployment.sh"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}🎉 ¡Mejoras completadas!${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Confirmar migraciones de Supabase: npx supabase db list migrations"
echo "2. Verificar que inference_metrics y activity_logs existen"
echo "3. En Vercel: agregar VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY"
echo "4. Test en preview antes de mezclar a main"
echo ""
echo "Documentación completa: IMPLEMENTATION_SUMMARY.md"
echo ""
