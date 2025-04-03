let pestanaActual = 'liquidos';

export const equivalencias = {
    liquidos: {
        mililitros: 1,
        litros: 1000,
        tazas: 240,
        cucharadas: 15,
        cucharaditas: 5
    },
    solidos: {
        gramos: 1,
        kilos: 1000,
        tazas: 125,
        cucharadas: 7.5,
        cucharaditas: 2.5
    }
};

export function cambiarPestana(nuevaPestana) {
    const btnLiquidos = document.getElementById('btn-liquidos');
    const btnSolidos = document.getElementById('btn-solidos');
    
    // Resetear estilos
    btnLiquidos.classList.remove('bg-[#8A5114]', 'text-white');
    btnLiquidos.classList.add('bg-[#efe6dc]', 'text-[#3C1D0C]');
    btnSolidos.classList.remove('bg-[#8A5114]', 'text-white');
    btnSolidos.classList.add('bg-[#efe6dc]', 'text-[#3C1D0C]');
    
    // Aplicar estilos activos
    if(nuevaPestana === 'liquidos') {
        btnLiquidos.classList.add('bg-[#8A5114]', 'text-white');
        btnLiquidos.classList.remove('bg-[#efe6dc]', 'text-[#3C1D0C]');
    } else {
        btnSolidos.classList.add('bg-[#8A5114]', 'text-white');
        btnSolidos.classList.remove('bg-[#efe6dc]', 'text-[#3C1D0C]');
    }

    // Mostrar contenido correspondiente
    document.getElementById('contenido-liquidos').classList.toggle('hidden', nuevaPestana !== 'liquidos');
    document.getElementById('contenido-solidos').classList.toggle('hidden', nuevaPestana !== 'solidos');
    
    pestanaActual = nuevaPestana;
    limpiarCampos();
}

export function convertirUnidad(categoria, unidadOrigen, valor) {
    if (!valor) return;
    
    const inputs = document.querySelectorAll(`[data-categoria="${categoria}"]`);
    const base = parseFloat(valor) * equivalencias[categoria][unidadOrigen];
    
    inputs.forEach(input => {
        if (input !== event.target) {
            const unidadDestino = input.getAttribute('oninput').split("'")[3];
            const resultado = base / equivalencias[categoria][unidadDestino];
            input.value = resultado % 1 === 0 ? resultado : resultado.toFixed(2);
        }
    });
}

export function limpiarCampos() {
    document.querySelectorAll(`[data-categoria="${pestanaActual}"]`).forEach(input => input.value = '');
}

export function abrirConversor() {
    document.getElementById('modal-conversor').classList.remove('hidden');
}

export function cerrarConversor() {
    document.getElementById('modal-conversor').classList.add('hidden');
}