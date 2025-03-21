// Funcion para cambiar tab seleccionado
function cambiarTab(tabId) {
    document.querySelectorAll('.tab-item').forEach(tab => {
        // Remover estilos activos
        tab.classList.remove(
            'active',
            'bg-[#301e1a]',
            'text-white'
        );

        // Aplicar estilos inactivos
        tab.classList.add(
            'text-black',
            'hover:bg-[#301e1a]/20'
        );
    });

    // Aplicar estilos al tab activo
    const activeTab = document.querySelector(`[data-target="${tabId}"]`);
    activeTab.classList.add(
        'bg-[#301e1a]',
        'text-white'
    );
    activeTab.classList.remove(
        'text-black',
        'hover:bg-[#301e1a]/20'
    );
}

// Función helper para mostrar esqueletos
function mostrarEsqueletoTabla(tbody, rows = 5) {
    tbody.innerHTML = Array.from({length: rows}, () => `
        <tr class="animate-pulse">
            <td class="p-3">
                <div class="h-4 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
            </td>
            <td class="p-3">
                <div class="h-4 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
            </td>
            <td class="p-3">
                <div class="h-4 bg-gray-200 rounded-full w-1/3 mx-auto"></div>
            </td>
            <td class="p-3 flex justify-center space-x-2">
                <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
            </td>
        </tr>
    `).join('');
}

// Función para mostrar el loader
function mostrarLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.hidden = false;
        document.body.classList.add('overflow-hidden'); // Bloquear scroll
    }
}

// Función para ocultar el loader
function ocultarLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.hidden = true;
        document.body.classList.remove('overflow-hidden'); // Restaurar scroll
    }
}

export const tabs = {
    cambiarTab : (endpoint) => cambiarTab(endpoint),
    mostrarEsqueletoTabla : (tbody) => mostrarEsqueletoTabla(tbody, 5),
    mostrarLoader : () => mostrarLoader(),
    ocultarLoader : () => ocultarLoader()
}