export interface TemplateFile {
    name: string;
    language: string;
    content: string;
}

export interface WebTemplate {
    id: string;
    name: string;
    description: string;
    icon: string; // Lucide icon name or emoji
    category: 'landing' | 'app' | 'portfolio' | 'data';
    files: TemplateFile[];
}

export const WEB_TEMPLATES: WebTemplate[] = [
    {
        id: 'startup-landing',
        name: 'Startup Moderno',
        description: 'Landing page de alta conversión con Hero, Features y Pricing.',
        icon: 'Rocket',
        category: 'landing',
        files: [
            {
                name: 'index.html',
                language: 'html',
                content: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Startup Nexa - El Futuro</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <style>
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gradient-text {
            background: linear-gradient(to right, #4ade80, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body class="bg-[#0a0a0f] text-white font-sans overflow-x-hidden">

    <!-- Nav -->
    <nav class="fixed w-full z-50 glass border-b-0 border-white/5">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center">
                    <span class="text-2xl font-bold gradient-text">NexaStart</span>
                </div>
                <div class="hidden md:block">
                    <div class="ml-10 flex items-baseline space-x-4">
                        <a href="#features" class="hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Características</a>
                        <a href="#pricing" class="hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Precios</a>
                        <a href="#" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-medium transition-all">Empezar</a>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero -->
    <div class="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10" data-aos="fade-up">
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                Construye el <span class="gradient-text">Futuro</span> hoy.
            </h1>
            <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
                La plataforma todo-en-uno que revoluciona la manera en que gestionas tus proyectos digitales. Rápido, seguro y escalable.
            </p>
            <div class="flex justify-center gap-4">
                <button class="px-8 py-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 font-bold text-lg transition-all transform hover:scale-105">
                    Comenzar Gratis
                </button>
                <button class="px-8 py-3 rounded-full glass hover:bg-white/10 font-bold text-lg transition-all">
                    Ver Demo
                </button>
            </div>
        </div>
        
        <!-- Background Elements -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
    </div>

    <!-- Features -->
    <div id="features" class="py-24 bg-[#0f0f16]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16" data-aos="fade-up">
                <h2 class="text-3xl font-extrabold gradient-text sm:text-4xl">
                    Todo lo que necesitas
                </h2>
                <p class="mt-4 text-gray-400">Herramientas potentes para equipos modernos.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div class="glass p-8 rounded-2xl hover:bg-white/5 transition-all" data-aos="fade-up" data-aos-delay="100">
                    <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Ultra Rápido</h3>
                    <p class="text-gray-400">Optimizado para velocidad y rendimiento máximo en cualquier dispositivo.</p>
                </div>
                <!-- Feature 2 -->
                <div class="glass p-8 rounded-2xl hover:bg-white/5 transition-all" data-aos="fade-up" data-aos-delay="200">
                    <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 text-green-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Seguro por Diseño</h3>
                    <p class="text-gray-400">Encriptación de grado militar y protección de datos desde el primer día.</p>
                </div>
                <!-- Feature 3 -->
                <div class="glass p-8 rounded-2xl hover:bg-white/5 transition-all" data-aos="fade-up" data-aos-delay="300">
                    <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 text-purple-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Analíticas Reales</h3>
                    <p class="text-gray-400">Toma decisiones basadas en datos con nuestro dashboard integrado.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-black py-12 border-t border-white/5">
        <div class="max-w-7xl mx-auto px-4 text-center text-gray-500">
            <p>&copy; 2024 NexaStart. Todos los derechos reservados.</p>
        </div>
    </footer>

    <script>
        AOS.init();
    </script>
</body>
</html>`
            }
        ]
    },
    {
        id: 'saas-dashboard',
        name: 'SaaS Dashboard',
        description: 'Panel de administración estilo cyberpunk con gráficas y tablas.',
        icon: 'LayoutDashboard',
        category: 'app',
        files: [
            {
                name: 'index.html',
                language: 'html',
                content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Nexus Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background-color: #0f172a; color: #e2e8f0; }
        .sidebar { min-height: 100vh; }
        .card { background-color: #1e293b; border: 1px solid #334155; }
    </style>
</head>
<body class="flex">

    <!-- Sidebar -->
    <aside class="sidebar w-64 bg-slate-900 border-r border-slate-800 hidden md:block">
        <div class="p-6 text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <i class="fas fa-bolt"></i> NEXUS
        </div>
        <nav class="mt-6 px-4 space-y-2">
            <a href="#" class="block px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center gap-3">
                <i class="fas fa-chart-line w-5"></i> Dashboard
            </a>
            <a href="#" class="block px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors">
                <i class="fas fa-users w-5"></i> Usuarios
            </a>
            <a href="#" class="block px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors">
                <i class="fas fa-cog w-5"></i> Configuración
            </a>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto h-screen">
        <header class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">Resumen General</h1>
            <div class="flex items-center gap-4">
                <button class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700">
                    <i class="fas fa-bell"></i>
                </button>
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500"></div>
            </div>
        </header>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="card p-6 rounded-xl">
                <div class="text-slate-400 mb-2">Ingresos Totales</div>
                <div class="text-3xl font-bold text-white">$45,231</div>
                <div class="text-green-400 text-sm mt-2"><i class="fas fa-arrow-up"></i> +20.1% vs mes pasado</div>
            </div>
            <div class="card p-6 rounded-xl">
                <div class="text-slate-400 mb-2">Usuarios Activos</div>
                <div class="text-3xl font-bold text-white">2,345</div>
                <div class="text-green-400 text-sm mt-2"><i class="fas fa-arrow-up"></i> +5.4% de crecimiento</div>
            </div>
            <div class="card p-6 rounded-xl">
                <div class="text-slate-400 mb-2">Ventas</div>
                <div class="text-3xl font-bold text-white">12,543</div>
                <div class="text-red-400 text-sm mt-2"><i class="fas fa-arrow-down"></i> -1.2% vs ayer</div>
            </div>
            <div class="card p-6 rounded-xl">
                <div class="text-slate-400 mb-2">Bounce Rate</div>
                <div class="text-3xl font-bold text-white">42.3%</div>
                <div class="text-green-400 text-sm mt-2">Estable</div>
            </div>
        </div>

        <!-- Charts Area -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card p-6 rounded-xl">
                <h3 class="text-xl font-bold mb-4">Ingresos Anuales</h3>
                <canvas id="revenueChart"></canvas>
            </div>
            <div class="card p-6 rounded-xl">
                <h3 class="text-xl font-bold mb-4">Usuarios Nuevos</h3>
                <canvas id="userChart"></canvas>
            </div>
        </div>
    </main>

    <script>
        // Charts Initialization
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Ingresos',
                    data: [12000, 19000, 3000, 5000, 22000, 30000],
                    borderColor: '#22d3ee',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(34, 211, 238, 0.1)'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: '#334155' } },
                    x: { grid: { color: '#334155' } }
                }
            }
        });

        const userCtx = document.getElementById('userChart').getContext('2d');
        new Chart(userCtx, {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
                datasets: [{
                    label: 'Usuarios',
                    data: [120, 190, 300, 500, 220, 300, 450],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: '#334155' } },
                    x: { grid: { display: false } }
                }
            }
        });
    </script>
</body>
</html>`
            }
        ]
    },
    {
        id: 'auth-supabase',
        name: 'Sistema de Login',
        description: 'Autenticación completa con Supabase lista para conectar.',
        icon: 'Lock',
        category: 'app',
        files: [
            {
                name: 'index.html',
                language: 'html',
                content: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Seguro - Nexa</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body {
            background-image: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%);
            min-height: 100vh;
        }
    </style>
</head>
<body class="flex items-center justify-center p-4 text-white">

    <div class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h2 class="text-3xl font-bold mb-2">Bienvenido</h2>
            <p class="text-gray-400">Ingresa a tu cuenta para continuar</p>
        </div>

        <form id="loginForm" class="space-y-6">
            <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input type="email" placeholder="tu@email.com" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
                <input type="password" placeholder="••••••••" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600">
            </div>

            <div class="flex items-center justify-between text-sm">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500">
                    <span class="text-gray-400">Recordarme</span>
                </label>
                <a href="#" class="text-purple-400 hover:text-purple-300">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg font-bold shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02]">
                Iniciar Sesión
            </button>
        </form>

        <div class="mt-8 text-center">
            <p class="text-gray-500 text-sm">
                ¿No tienes cuenta? <a href="#" class="text-purple-400 hover:text-purple-300 font-medium">Regístrate gratis</a>
            </p>
        </div>
        
        <!-- Status Message -->
        <div id="status" class="mt-4 text-center text-sm hidden"></div>
    </div>

    <script>
        // Supabase Client Initialization (Placeholder credentials)
        // const supabaseUrl = 'YOUR_SUPABASE_URL';
        // const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
        // const supabase = supabase.createClient(supabaseUrl, supabaseKey);

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const status = document.getElementById('status');
            status.textContent = 'Conectando con Supabase... (Demo Mode)';
            status.className = 'mt-4 text-center text-sm text-yellow-400 block';
            
            setTimeout(() => {
                status.textContent = 'Simulación exitosa. Configura las credenciales reales en el código.';
                status.className = 'mt-4 text-center text-sm text-green-400 block';
            }, 1500);
        });
    </script>
</body>
</html>`
            }
        ]
    }
];
