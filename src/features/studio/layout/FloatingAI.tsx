"use client";

import React from 'react';

export default function FloatingAI() {
    const handleClick = () => {
        alert("¡Hola! Soy NEXA LITERIS. ¿Necesitas ayuda con títulos, desarrollo de personajes o edición?");
    };

    return (
        <div className="floating-ai" onClick={handleClick} title="Asistente IA">
            <i className="fas fa-brain"></i>
        </div>
    );
}
