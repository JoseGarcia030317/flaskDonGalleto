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
    tbody.innerHTML = Array.from({ length: rows }, () => `
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

function mostrarEsqueletoMainContent() {
    return `
        <div class="flex flex-col h-screen animate-pulse">
            <!-- Tabs Skeleton -->
            <div class="border-b border-gray-200 mb-4">
                <div class="flex space-x-4">
                    <div class="h-10 bg-gray-200 rounded-t-lg w-32"></div>
                    <div class="h-10 bg-gray-200 rounded-t-lg w-28"></div>
                </div>
            </div>

            <!-- Content Skeleton -->
            <div class="flex-1 overflow-y-auto p-4">
                <div class="space-y-6">
                    <!-- Search Bar -->
                    <div class="h-12 bg-gray-200 rounded w-full"></div>
                    
                    <div class="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    `;
}

function mostrarEsqueletoModuloContent() {
    return `
        <div class="skeleton-loading animate-pulse">
            <div class="h-12 bg-gray-200 mb-4 rounded"></div>
            <div class="h-32 bg-gray-200 rounded"></div>
        </div>
    `;
}

function bloquearTabs() {
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.add('pointer-events-none');
    });
}

function desbloquearTabs() {
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('pointer-events-none');
    });
}

function mostrarLoader() {
    document.getElementById('loader').hidden = false;
}

function ocultarLoader() {
    document.getElementById('loader').hidden = true;
}

export const tabs = {
    cambiarTab: (endpoint) => cambiarTab(endpoint),
    mostrarEsqueletoTabla: (tbody) => mostrarEsqueletoTabla(tbody, 5),
    mostrarEsqueletoMainContent: () => mostrarEsqueletoMainContent(),
    mostrarEsqueletoModuloContent: () => mostrarEsqueletoModuloContent(),
    bloquearTabs: () => bloquearTabs(),
    desbloquearTabs: () => desbloquearTabs(),
    mostrarLoader: () => mostrarLoader(),
    ocultarLoader: () => ocultarLoader()
}