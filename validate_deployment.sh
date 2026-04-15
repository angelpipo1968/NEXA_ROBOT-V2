#!/bin/bash
#
# validate_deployment.sh
# Valida que todas las variables y configuraciones necesarias estén presentes antes de desplegar
#

set -e  # Exit on error

echo "🔍 NEXA Deployment Validator"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check variable
check_var() {
    local var_name=$1
    local var_value=${!var_name:-}
    local required=${2:-true}
    
    if [ -z "$var_value" ]; then
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ MISSING (Required): $var_name${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠️ MISSING (Optional): $var_name${NC}"
            ((WARNINGS++))
        fi
    else
        # Mask sensitive info
        if [[ $var_name == *"KEY"* ]] || [[ $var_name == *"TOKEN"* ]]; then
            local masked="${var_value:0:8}...${var_value: -4}"
            echo -e "${GREEN}✅ SET: $var_name = $masked${NC}"
        else
            echo -e "${GREEN}✅ SET: $var_name${NC}"
        fi
    fi
}

echo ""
echo "1️⃣ Environment Variables"
echo "------------------------"

# Required
check_var "VITE_SUPABASE_URL" "true"
check_var "VITE_SUPABASE_ANON_KEY" "true"
check_var "VITE_GEMINI_API_KEY" "true"

# Optional
check_var "VITE_ELEVENLABS_API_KEY" "false"

echo ""
echo "2️⃣ File Structure"
echo "------------------"

# Check critical files
declare -a files=(
    "supabase/migrations/20260203_memories_schema.sql"
    "supabase/FULL_SCHEMA.sql"
    "supabase/functions/nexa-core/index.ts"
    ".github/workflows/deploy.yml"
    "vercel.json"
    "package.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Found: $file${NC}"
    else
        echo -e "${RED}❌ MISSING: $file${NC}"
        ((ERRORS++))
    fi
done

echo ""
echo "3️⃣ Code Quality"
echo "----------------"

if command -v npm &> /dev/null; then
    echo "Running lint check..."
    if npm run lint 2>/dev/null | grep -q "error"; then
        echo -e "${RED}❌ Lint errors found${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ No lint errors${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ npm not found, skipping lint${NC}"
fi

echo ""
echo "4️⃣ SQL Syntax Validation"
echo "------------------------"

# Check for common SQL errors in migration files
if grep -q "shadow-sm" "supabase/migrations/20260203_memories_schema.sql"; then
    echo -e "${RED}❌ Invalid SQL: Found 'shadow-sm' in migration${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ No obvious SQL errors in migrations${NC}"
fi

# Check that FULL_SCHEMA.sql has required tables
declare -a required_tables=(
    "public.profiles"
    "public.memories"
    "public.conversations"
    "public.messages"
    "public.cognitive_cycles"
)

for table in "${required_tables[@]}"; do
    if grep -q "$table" "supabase/FULL_SCHEMA.sql"; then
        echo -e "${GREEN}✅ Schema includes: $table${NC}"
    else
        echo -e "${RED}❌ Missing in schema: $table${NC}"
        ((ERRORS++))
    fi
done

# Check for required RPC functions
if grep -q "CREATE OR REPLACE FUNCTION match_memories" "supabase/FULL_SCHEMA.sql"; then
    echo -e "${GREEN}✅ RPC function defined: match_memories${NC}"
else
    echo -e "${RED}❌ Missing RPC: match_memories${NC}"
    ((ERRORS++))
fi

echo ""
echo "5️⃣ GitHub Actions Secrets"
echo "--------------------------"

if [ -f ".github/workflows/deploy.yml" ]; then
    declare -a required_secrets=(
        "VERCEL_TOKEN"
        "VERCEL_ORG_ID"
        "VERCEL_PROJECT_ID"
        "SUPABASE_PROJECT_ID"
        "SUPABASE_ACCESS_TOKEN"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    echo "Required GitHub secrets (add if missing):"
    for secret in "${required_secrets[@]}"; do
        echo "  ⚠️ $secret"
    done
else
    echo -e "${YELLOW}⚠️ .github/workflows/deploy.yml not found${NC}"
fi

echo ""
echo "================================"
echo "📊 Summary"
echo "================================"
echo -e "Errors:   ${RED}${ERRORS}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Verify GitHub secrets are configured"
    echo "2. Run: npm run build"
    echo "3. Deploy: git push origin main"
    exit 0
else
    echo -e "${RED}❌ Fix errors before deploying${NC}"
    exit 1
fi
