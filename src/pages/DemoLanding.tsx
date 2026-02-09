
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Zap, Shield, Globe, Rocket, Play, Star, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                            N
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">NexaFlow</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Características</a>
                        <a href="#pricing" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Precios</a>
                        <a href="#about" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Nosotros</a>
                        <button className="bg-gray-900 dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-medium text-sm hover:opacity-90 transition-opacity">
                            Empezar Gratis
                        </button>
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-black border-b border-gray-100 dark:border-white/5 p-4">
                    <div className="flex flex-col gap-4">
                        <a href="#features" className="text-base font-medium text-gray-600 dark:text-gray-300">Características</a>
                        <a href="#pricing" className="text-base font-medium text-gray-600 dark:text-gray-300">Precios</a>
                        <button className="w-full bg-blue-600 text-white px-5 py-3 rounded-lg font-medium">
                            Empezar Gratis
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[100px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-semibold mb-6 border border-blue-100 dark:border-blue-800"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Novedad: Integración con IA 2.0
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6"
                >
                    Construye el futuro <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600"> sin escribir código.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    NexaFlow te permite crear aplicaciones web modernas, automatizaciones y flujos de trabajo complejos con una interfaz visual intuitiva impulsada por IA.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2">
                        <Rocket size={20} />
                        Empezar Ahora
                    </button>
                    <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl font-medium text-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                        <Play size={20} className="fill-current" />
                        Ver Demo
                    </button>
                </motion.div>

                {/* Dashboard Image */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-20 relative mx-auto max-w-5xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0a0a] via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden p-2">
                        <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-[16/9] relative group">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-400 dark:text-gray-500 font-medium">Dashboard Interface Preview</span>
                            </div>
                            {/* Mock UI Elements */}
                            <div className="absolute top-4 left-4 right-4 flex gap-4">
                                <div className="w-1/4 h-32 bg-white dark:bg-gray-700 rounded-lg shadow-sm animate-pulse" />
                                <div className="w-1/4 h-32 bg-white dark:bg-gray-700 rounded-lg shadow-sm animate-pulse delay-75" />
                                <div className="w-1/4 h-32 bg-white dark:bg-gray-700 rounded-lg shadow-sm animate-pulse delay-100" />
                                <div className="w-1/4 h-32 bg-white dark:bg-gray-700 rounded-lg shadow-sm animate-pulse delay-150" />
                            </div>
                            <div className="absolute top-40 left-4 right-4 bottom-4 flex gap-4">
                                <div className="w-2/3 h-full bg-white dark:bg-gray-700 rounded-lg shadow-sm" />
                                <div className="w-1/3 h-full bg-white dark:bg-gray-700 rounded-lg shadow-sm" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const Features = () => {
    const features = [
        {
            icon: <Zap className="text-yellow-500" />,
            title: "Velocidad Extrema",
            desc: "Construye 10x más rápido con nuestros componentes pre-diseñados y sistema de arrastrar y soltar."
        },
        {
            icon: <Shield className="text-green-500" />,
            title: "Seguridad Enterprise",
            desc: "Certificaciones SOC2 y GDPR listas desde el primer día. Tus datos están siempre seguros."
        },
        {
            icon: <Globe className="text-blue-500" />,
            title: "Despliegue Global",
            desc: "Tu aplicación se distribuye automáticamente en nuestra red Edge en menos de 2 segundos."
        }
    ];

    return (
        <section id="features" className="py-24 bg-gray-50 dark:bg-[#0f0f12]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Características</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Todo lo que necesitas para escalar
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
                        Deja de preocuparte por la infraestructura y enfócate en crear valor para tus usuarios.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-[#1a1a20] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all"
                        >
                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 text-2xl">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Pricing = () => {
    return (
        <section id="pricing" className="py-24 bg-white dark:bg-[#0a0a0f]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Planes simples y transparentes
                    </h2>
                    <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                        Comienza gratis y escala según tus necesidades.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition-colors">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Starter</h3>
                        <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                            <span className="text-5xl font-extrabold tracking-tight">$0</span>
                            <span className="ml-1 text-xl font-semibold text-gray-500">/mes</span>
                        </div>
                        <p className="mt-5 text-gray-500 text-sm">Perfecto para prototipos y hobby.</p>
                        <ul className="mt-6 space-y-4">
                            {['1 Proyecto', 'Analytics básico', 'Soporte comunitario'].map((feature) => (
                                <li key={feature} className="flex">
                                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                    <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="mt-8 w-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 py-3 rounded-lg font-bold hover:bg-blue-100 transition-colors">
                            Crear cuenta gratis
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="border-2 border-blue-600 rounded-2xl p-8 relative transform scale-105 bg-white dark:bg-[#15151a] shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                            Popular
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Pro</h3>
                        <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                            <span className="text-5xl font-extrabold tracking-tight">$29</span>
                            <span className="ml-1 text-xl font-semibold text-gray-500">/mes</span>
                        </div>
                        <p className="mt-5 text-gray-500 text-sm">Para creadores y startups serias.</p>
                        <ul className="mt-6 space-y-4">
                            {['Proyectos ilimitados', 'Dominio personalizado', 'Analytics avanzado', 'Soporte prioritario 24/7'].map((feature) => (
                                <li key={feature} className="flex">
                                    <CheckCircle size={20} className="text-blue-500 flex-shrink-0" />
                                    <span className="ml-3 text-gray-600 dark:text-gray-300 font-medium text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                            Comenzar Prueba Gratuita
                        </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition-colors">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Enterprise</h3>
                        <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                            <span className="text-4xl font-extrabold tracking-tight">Custom</span>
                        </div>
                        <p className="mt-5 text-gray-500 text-sm">Para grandes organizaciones.</p>
                        <ul className="mt-6 space-y-4">
                            {['SLA garantizado', 'SSO & Audit Logs', 'Gerente de cuenta dedicado'].map((feature) => (
                                <li key={feature} className="flex">
                                    <CheckCircle size={20} className="text-gray-400 flex-shrink-0" />
                                    <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="mt-8 w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                            Contactar Ventas
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="bg-gray-50 dark:bg-[#050505] border-t border-gray-200 dark:border-white/5 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xs">
                        N
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">NexaFlow Inc.</span>
                </div>
                <div className="text-sm text-gray-500">
                    © 2026 NexaFlow. Todos los derechos reservados.
                </div>
                <div className="flex gap-6">
                    <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><Globe size={20} /></a>
                </div>
            </div>
        </footer>
    );
};

export default function DemoLanding() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white font-sans selection:bg-blue-500/30">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <Footer />
        </div>
    );
}
