// Funcion para cambiar tab seleccionado
function cambiarTab(tabId) {
    document.querySelectorAll('.tab-item').forEach(tab => {
        // Remover estilos activos
        tab.classList.remove(
            'active',
            'bg-[#8A5114]',
            'text-white'
        );

        // Aplicar estilos inactivos
        tab.classList.add(
            'text-black',
            'hover:bg-[#8A5114]/20'
        );
    });

    // Aplicar estilos al tab activo
    const activeTab = document.querySelector(`[data-target="${tabId}"]`);
    activeTab.classList.add(
        'bg-[#8A5114]',
        'text-white'
    );
    activeTab.classList.remove(
        'text-black',
        'hover:bg-[#8A5114]/20'
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

export const tabs = {
    cambiarTab : (endpoint) => cambiarTab(endpoint),
    mostrarEsqueletoTabla : (tbody) => mostrarEsqueletoTabla(tbody, 5)
}