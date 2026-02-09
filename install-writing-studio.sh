#!/bin/bash
# install-writing-studio.sh

echo "📚 INSTALANDO NEXA WRITING STUDIO ULTIMATE"

# 1. Crear estructura completa
mkdir -p packages/studio/src/{core,ai,voice,editor,templates,library,export,corrector}
mkdir -p apps/web/src/components/{editor,templates,library,voice,ai}
mkdir -p apps/web/src/app/writing-studio

# 2. Instalar dependencias en apps/web
echo "📦 Installing dependencies in apps/web..."
cd apps/web
npm install jspdf html-to-text mammoth showdown uuid date-fns lucide-react wavesurfer.js recorder-js tone @radix-ui/react-tabs @radix-ui/react-dialog @radix-ui/react-dropdown-menu lodash zustand immer --save
cd ../..

# 3. Crear archivos base (Placeholders to be filled by AI)
echo "📝 Creando sistema completo..."

# Note: The actual content population will be done by the AI agent in subsequent steps
# to ensure high quality and error checking, rather than using cat in bash.

echo "✅ Estructura creada y dependencias instaladas."
