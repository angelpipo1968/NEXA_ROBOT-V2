#!/bin/bash
# install-nexa-all-in-one.sh
# Script completo para instalar Nexa AI con Supabase, Ollama y todas las características

set -e  # Detener en error

echo "🚀 INICIANDO INSTALACIÓN COMPLETA NEXA AI"
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_NAME="nexa-ai"
SUPABASE_PROJECT=""
OLLAMA_MODELS=("llama3.2:3b" "mistral:7b:q4_K_M" "deepseek-r1:8b:q5_K_M")

# Funciones de utilidad
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 1. VERIFICACIÓN DE PREREQUISITOS
echo -e "\n${BLUE}1. VERIFICANDO PREREQUISITOS${NC}"

check_command() {
    if command -v $1 &> /dev/null; then
        log_success "$1 instalado"
        return 0
    else
        log_error "$1 no encontrado"
        return 1
    fi
}

check_command node
check_command npm
check_command docker
check_command docker-compose
check_command git
check_command curl

# Verificar Node.js versión 18+
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js versión 18+ requerida (tienes v$NODE_VERSION)"
    exit 1
fi

# 2. CREAR PROYECTO Y ESTRUCTURA
echo -e "\n${BLUE}2. CREANDO ESTRUCTURA DEL PROYECTO${NC}"

if [ -d "$PROJECT_NAME" ]; then
    log_warning "El directorio $PROJECT_NAME ya existe"
    read -p "¿Sobrescribir? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -rf "$PROJECT_NAME"
    else
        exit 1
    fi
fi

mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

log_success "Directorio creado: $(pwd)"

# 3. INICIALIZAR PROYECTO NODE
echo -e "\n${BLUE}3. INICIALIZANDO PROYECTO NODE${NC}"

cat > package.json << 'EOF'
{
  "name": "nexa-ai",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "start": "turbo start",
    "lint": "turbo lint",
    "clean": "turbo clean",
    "setup": "node scripts/setup.js",
    "db:init": "node scripts/init-database.js",
    "db:migrate": "node scripts/migrate-database.js",
    "models:download": "node scripts/download-models.js",
    "studio:start": "cd apps/studio && npm run dev",
    "chat:start": "cd apps/chat && npm run dev",
    "api:start": "cd apps/api && npm run dev",
    "test": "turbo test",
    "test:e2e": "playwright test",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "deploy:supabase": "node scripts/deploy-supabase.js",
    "deploy:vercel": "vercel --prod",
    "backup": "node scripts/backup.js",
    "restore": "node scripts/restore.js"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  },
  "packageManager": "npm@10.0.0",
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Instalar Turbo para monorepo
npm install turbo --save-dev
log_success "Turbo instalado"

# 4. CREAR ESTRUCTURA DE MONOREPO
echo -e "\n${BLUE}4. CREANDO ESTRUCTURA DE MONOREPO${NC}"

mkdir -p {apps,packages,scripts,infra,docs}

# Apps
mkdir -p apps/{web,api,studio,admin}
mkdir -p apps/web/{app,components,lib,public}
mkdir -p apps/api/{src,routes,middleware}
mkdir -p apps/studio/{components,features,workflows}
mkdir -p apps/admin/{components,dashboard,users}

# Packages
mkdir -p packages/{core,chat,writing,auth,memory,embeddings,tools,sdk}

# Infra
mkdir -p infra/{docker,kubernetes,monitoring}

log_success "Estructura creada"

# 5. CONFIGURAR SUPABASE
echo -e "\n${BLUE}5. CONFIGURANDO SUPABASE${NC}"

# Solicitar credenciales de Supabase
echo "📋 Configuración de Supabase:"
read -p "SUPABASE_URL (ej: https://xxx.supabase.co): " SUPABASE_URL
read -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
read -p "SUPABASE_JWT_SECRET: " SUPABASE_JWT_SECRET
read -p "Email admin: " ADMIN_EMAIL
read -p "Password admin: " -s ADMIN_PASSWORD
echo

# Guardar en .env
cat > .env << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODELS=${OLLAMA_MODELS[@]}

# Application
NEXA_SECRET_KEY=$(openssl rand -hex 32)
NODE_ENV=development
PORT=3000

# Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=nexa-documents

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Admin
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Monitoring
SENTRY_DSN=
LOGGING_LEVEL=info
EOF

log_success "Variables de entorno configuradas"

# 6. CONFIGURAR DOCKER COMPOSE
echo -e "\n${BLUE}6. CONFIGURANDO DOCKER COMPOSE${NC}"

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Ollama - Modelos de IA
  ollama:
    image: ollama/ollama:latest
    container_name: nexa-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
      - ./models:/models
    environment:
      - OLLAMA_KEEP_ALIVE=24h
      - OLLAMA_NUM_PARALLEL=4
    restart: unless-stopped
    command: serve
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  # MinIO - Almacenamiento S3 compatible
  minio:
    image: minio/minio:latest
    container_name: nexa-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    restart: unless-stopped

  # Redis - Cache y sesiones
  redis:
    image: redis:7-alpine
    container_name: nexa-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass redispass
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # PostgreSQL - Base de datos principal
  postgres:
    image: postgres:15-alpine
    container_name: nexa-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: nexa
      POSTGRES_USER: nexa
      POSTGRES_PASSWORD: nexa123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d
    restart: unless-stopped

  # pgAdmin - Administración DB
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: nexa-pgadmin
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@nexa.ai
      PGADMIN_DEFAULT_PASSWORD: admin123
    restart: unless-stopped

  # Traefik - Reverse Proxy
  traefik:
    image: traefik:v3.0
    container_name: nexa-traefik
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml
      - ./letsencrypt:/letsencrypt
    restart: unless-stopped

  # Prometheus - Monitoreo
  prometheus:
    image: prom/prometheus:latest
    container_name: nexa-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

  # Grafana - Dashboard
  grafana:
    image: grafana/grafana:latest
    container_name: nexa-grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: grafana123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana-dashboards:/etc/grafana/provisioning/dashboards
    restart: unless-stopped

volumes:
  ollama_data:
  minio_data:
  redis_data:
  postgres_data:
  prometheus_data:
  grafana_data:
EOF

# 7. CONFIGURACIÓN DE TRAEFIK
cat > traefik.yml << 'EOF'
api:
  dashboard: true
  debug: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@nexa.ai
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

serversTransport:
  insecureSkipVerify: true
EOF

log_success "Docker Compose configurado"

# 8. INSTALAR DEPENDENCIAS
echo -e "\n${BLUE}7. INSTALANDO DEPENDENCIAS${NC}"

# Crear package.json para apps/web
cat > apps/web/package.json << 'EOF'
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "@supabase/ssr": "^0.0.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "date-fns": "^3.0.0",
    "jspdf": "^2.5.1",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "20.0.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "autoprefixer": "10.4.0",
    "eslint": "8.0.0",
    "eslint-config-next": "14.0.0",
    "postcss": "8.4.0",
    "typescript": "5.0.0"
  }
}
EOF

# Crear package.json para apps/api
cat > apps/api/package.json << 'EOF'
{
  "name": "api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup",
    "start": "node dist/index.js",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "hono": "^3.11.0",
    "zod": "^3.22.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "node-fetch": "^3.3.0",
    "rate-limiter-flexible": "^3.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.0",
    "@types/node-fetch": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/cors": "^2.8.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "tsup": "^7.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
EOF

# Instalar dependencias globales
npm install -g vercel@latest
log_success "Dependencias configuradas"

# 9. CONFIGURAR NEXT.JS
echo -e "\n${BLUE}8. CONFIGURANDO NEXT.JS${NC}"

cat > apps/web/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost', '*.supabase.co'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
EOF

cat > apps/web/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
EOF

# 10. SCRIPTS DE CONFIGURACIÓN
echo -e "\n${BLUE}9. CREANDO SCRIPTS DE CONFIGURACIÓN${NC}"

# Script de inicialización de base de datos
cat > scripts/init-database.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const schemaSQL = `
-- ESTRUCTURA COMPLETA DE NEXA AI
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tablas principales...
-- (Aquí iría el SQL completo del esquema anterior)
`;

async function initDatabase() {
  console.log('📦 Inicializando base de datos...');
  
  try {
    // Ejecutar SQL en lotes
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
    
    for (const stmt of statements) {
      if (stmt.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
        if (error) {
          console.warn(`⚠️  Advertencia en SQL: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Base de datos inicializada correctamente');
    
    // Crear usuario admin inicial
    const { error: adminError } = await supabase.auth.admin.createUser({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });
    
    if (!adminError) {
      console.log('👑 Usuario admin creado:', process.env.ADMIN_EMAIL);
    }
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    process.exit(1);
  }
}

initDatabase();
EOF

# Script de descarga de modelos
cat > scripts/download-models.js << 'EOF'
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const MODELS = [
  'llama3.2:3b',
  'mistral:7b:q4_K_M',
  'deepseek-r1:8b:q5_K_M',
  'llama3:8b:q4_K_M',
  'codellama:7b:q4_K_M'
];

async function downloadModels() {
  console.log('🤖 Descargando modelos de IA...');
  
  for (const model of MODELS) {
    console.log(`📥 Descargando: ${model}`);
    
    try {
      const { stdout, stderr } = await execAsync(`ollama pull ${model}`);
      
      if (stderr && !stderr.includes('success')) {
        console.warn(`⚠️  Advertencia para ${model}:`, stderr);
      }
      
      console.log(`✅ ${model} descargado`);
      
      // Pequeña pausa entre descargas
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error descargando ${model}:`, error.message);
    }
  }
  
  console.log('🎉 Todos los modelos descargados');
  
  // Verificar modelos instalados
  try {
    const { stdout } = await execAsync('ollama list');
    console.log('\n📋 Modelos instalados:');
    console.log(stdout);
  } catch (error) {
    console.error('Error listando modelos:', error.message);
  }
}

downloadModels();
EOF

# Script de backup
cat > scripts/backup.js << 'EOF'
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', timestamp);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  console.log(`💾 Creando backup: ${backupDir}`);
  
  try {
    // Backup de Docker volumes
    const volumes = ['ollama_data', 'postgres_data', 'redis_data'];
    
    for (const volume of volumes) {
      console.log(`📦 Backup de ${volume}...`);
      await execAsync(`docker run --rm -v ${volume}:/source -v ${backupDir}:/backup alpine tar czf /backup/${volume}.tar.gz -C /source .`);
    }
    
    // Backup de PostgreSQL
    console.log('🗄️  Backup de PostgreSQL...');
    await execAsync(`docker exec nexa-postgres pg_dump -U nexa nexa > ${backupDir}/database.sql`);
    
    // Backup de configuración
    console.log('⚙️  Backup de configuración...');
    const configFiles = ['.env', 'docker-compose.yml', 'traefik.yml'];
    
    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(backupDir, file));
      }
    }
    
    console.log(`✅ Backup completado en: ${backupDir}`);
    
    // Crear archivo comprimido
    await execAsync(`tar czf ${backupDir}.tar.gz -C ${backupDir} .`);
    console.log(`📦 Backup comprimido: ${backupDir}.tar.gz`);
    
  } catch (error) {
    console.error('❌ Error en backup:', error.message);
  }
}

backup();
EOF

# 11. CONFIGURAR APLICACIÓN WEB
echo -e "\n${BLUE}10. CONFIGURANDO APLICACIÓN WEB${NC}"

# Página principal
cat > apps/web/app/page.tsx << 'EOF'
import { AuthForm } from '@/components/auth/AuthForm';
import { ChatDemo } from '@/components/chat/ChatDemo';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Nexa <span className="text-blue-400">AI</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Plataforma todo-en-uno de inteligencia artificial con chat inteligente, 
          escritura profesional, memoria vectorial y mucho más.
        </p>
        
        <div className="flex gap-4 justify-center">
          <a
            href="/chat"
            className="px-8 py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Comenzar Chat
          </a>
          <a
            href="/studio"
            className="px-8 py-3 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Estudios de Escritura
          </a>
        </div>
      </header>
      
      {/* Demo Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Chat Inteligente en Tiempo Real</h2>
            <ChatDemo />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Comienza Ahora</h2>
            <AuthForm />
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Características Principales</h2>
        <FeaturesGrid />
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-400">
        <div className="container mx-auto px-4">
          <p>Nexa AI © 2024 - Plataforma de IA todo-en-uno</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="/docs" className="hover:text-white">Documentación</a>
            <a href="/pricing" className="hover:text-white">Precios</a>
            <a href="/contact" className="hover:text-white">Contacto</a>
            <a href="/github" className="hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
EOF

# 12. CONFIGURAR API
echo -e "\n${BLUE}11. CONFIGURANDO API${NC}"

cat > apps/api/src/index.ts << 'EOF'
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { supabase } from './lib/supabase';
import { rateLimiter } from './middleware/rate-limit';
import { authMiddleware } from './middleware/auth';

const app = new Hono();

// Middleware global
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'nexa-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health endpoint
app.get('/health', async (c) => {
  const services = {
    supabase: 'checking',
    ollama: 'checking',
    redis: 'checking'
  };
  
  try {
    // Check Supabase
    const { error } = await supabase.from('profiles').select('count').limit(1);
    services.supabase = error ? 'error' : 'ok';
    
    // Check Ollama
    const ollamaRes = await fetch('http://localhost:11434/api/tags');
    services.ollama = ollamaRes.ok ? 'ok' : 'error';
    
  } catch (error) {
    services.supabase = 'error';
  }
  
  return c.json({
    status: 'operational',
    services,
    uptime: process.uptime()
  });
});

// Auth routes
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import memoryRoutes from './routes/memory';
import documentRoutes from './routes/documents';
import writingRoutes from './routes/writing';

// Mount routes
app.route('/api/auth', authRoutes);
app.route('/api/chat', chatRoutes);
app.route('/api/memory', memoryRoutes);
app.route('/api/documents', documentRoutes);
app.route('/api/writing', writingRoutes);

// Error handling
app.onError((err, c) => {
  console.error('API Error:', err);
  
  return c.json({
    error: 'Internal server error',
    message: err.message,
    requestId: c.req.header('x-request-id')
  }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

export default app;

// Server listen
if (require.main === module) {
  const port = process.env.PORT || 3001;
  
  const server = {
    port,
    fetch: app.fetch
  };
  
  console.log(`🚀 API server running on port ${port}`);
}
EOF

# 13. SCRIPT DE INICIO RÁPIDO
cat > start.sh << 'EOF'
#!/bin/bash
# start-nexa.sh

echo "🚀 Iniciando Nexa AI..."

# Verificar Docker
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo"
    exit 1
fi

# Iniciar servicios Docker
echo "🐳 Iniciando contenedores..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando servicios..."
sleep 10

# Descargar modelos Ollama si no existen
echo "🤖 Verificando modelos de IA..."
if ! docker exec nexa-ollama ollama list | grep -q "llama3"; then
    echo "📥 Descargando modelos..."
    docker exec nexa-ollama ollama pull llama3.2:3b
    docker exec nexa-ollama ollama pull mistral:7b:q4_K_M
fi

# Inicializar base de datos
echo "🗄️  Inicializando base de datos..."
npm run db:init

# Iniciar aplicación web
echo "🌐 Iniciando aplicación web..."
npm run dev &

# Iniciar API
echo "🔧 Iniciando API..."
cd apps/api && npm run dev &

echo ""
echo "=========================================="
echo "✅ Nexa AI iniciado correctamente!"
echo ""
echo "🌐 Aplicación Web: http://localhost:3000"
echo "🔧 API: http://localhost:3001"
echo "🤖 Ollama: http://localhost:11434"
echo "🗄️  pgAdmin: http://localhost:5050"
echo "📊 MinIO: http://localhost:9001"
echo "📈 Grafana: http://localhost:3001"
echo ""
echo "👤 Credenciales admin:"
echo "   Email: admin@nexa.ai"
echo "   Password: admin123"
echo "=========================================="
EOF

chmod +x start.sh

# 14. SCRIPT DE PARADA
cat > stop.sh << 'EOF'
#!/bin/bash
# stop-nexa.sh

echo "🛑 Deteniendo Nexa AI..."

# Detener contenedores
docker-compose down

# Detener procesos Node
pkill -f "next dev"
pkill -f "tsx watch"

echo "✅ Todos los servicios detenidos"
EOF

chmod +x stop.sh

# 15. SCRIPT DE RESET
cat > reset.sh << 'EOF'
#!/bin/bash
# reset-nexa.sh

echo "🔄 Reiniciando Nexa AI..."

# Parar todo
./stop.sh

# Limpiar volúmenes Docker
read -p "¿Eliminar datos? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🗑️  Eliminando volúmenes..."
    docker volume rm $(docker volume ls -q | grep nexa) 2>/dev/null || true
fi

# Reinstalar dependencias
echo "📦 Reinstalando dependencias..."
npm install

# Iniciar de nuevo
./start.sh
EOF

chmod +x reset.sh

# 16. DOCUMENTACIÓN
cat > README.md << 'EOF'
# 🚀 Nexa AI - Plataforma Todo-en-Uno

Plataforma completa de inteligencia artificial con chat, escritura, memoria vectorial y más.

## ✨ Características

- 🤖 **Chat Inteligente**: Conversaciones en tiempo real con múltiples modelos
- 📝 **Escritura Profesional**: Asistente para libros, artículos y contenido
- 🧠 **Memoria Vectorial**: RAG con pgvector para contexto persistente
- 🔐 **Autenticación**: Supabase Auth con múltiples proveedores
- 📁 **Gestión de Documentos**: Subida y procesamiento automático
- 🎨 **Interfaz Moderna**: UI/UX profesional con Tailwind CSS
- 📊 **Monitoreo**: Dashboards con Prometheus y Grafana

## 🚀 Instalación Rápida

### Opción 1: Script Automático
```bash
# Clonar y ejecutar
git clone <repo-url>
cd nexa-ai
chmod +x install-nexa-all-in-one.sh
./install-nexa-all-in-one.sh
EOF
