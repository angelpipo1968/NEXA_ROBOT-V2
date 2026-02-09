'use client';

export default function ProjectsPage() {
    return (
        <section className="flex-1 flex flex-col p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
            <h1 className="vp-hero-title mb-2">Proyectos</h1>
            <p className="vp-hero-subtitle mb-8">
                Aquí podrás ver, organizar y retomar tus proyectos NEXA OS.
            </p>
            <div className="vp-card">
                <p className="vp-card-label">Estado</p>
                <p className="vp-card-text">
                    Próximamente: tablero de proyectos, estados, etiquetas y vistas inteligentes.
                </p>
            </div>
        </section>
    );
}
