import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';

const horneados = [
    {
        id_horneado: 1,
        lote: "234546",
        receta: {
            id: 1,
            nombre: "Receta Clásica",
            tiempo: 45,
            cantidad: 120,
            insumos: ["Harina", "Huevos", "Mantequilla"]
        },
        fecha_horneado: "30/10/2024 13:00",
        estatus: "En proceso"
    },
    {
        id_horneado: 2,
        lote: "234546",
        receta: {
            id: 1,
            nombre: "Receta Clásica",
            tiempo: 45,
            cantidad: 120,
            insumos: ["Harina", "Huevos", "Mantequilla"]
        },
        fecha_horneado: "30/10/2024 13:00",
        estatus: "En proceso"
    },
    {
        id_horneado: 3,
        lote: "234546",
        receta: {
            id: 1,
            nombre: "Receta Clásica",
            tiempo: 45,
            cantidad: 120,
            insumos: ["Harina", "Huevos", "Mantequilla"]
        },
        fecha_horneado: "30/10/2024 13:00",
        estatus: "En proceso"
    },
]

function cargarModuloSolicitudes(){
    const container = document.getElementById("solicitudes-container");
    tabs.mostrarEsqueletoCardGalleta(container);
    generarCards();
}

function generarCards() {
    const container = document.getElementById('solicitudes-container');
    container.innerHTML = "";
    horneados.forEach(horneado => {
        const card = document.createElement('div');
        card.className = 'bg-[#efe6dc] rounded-xl shadow-md overflow-hidden border border-gray-200';
        card.innerHTML = `
            <div class="flex flex-col relative mb-1">
                <span class="absolute top-2 right-2 w-5 h-5 bg-yellow-500 rounded-full"></span>
                <div class="flex items-center h-24">
                    <div class="w-1/3 flex items-center justify-center">
                      <img src="../../../static/images/galleta ejemplo.png" 
                                           alt="galleta" 
                                           class="h-24 w-24 pl-2 object-contain">
                    </div>

                    <div class="flex items-center h-24">
                      <div class="max-w-60 pl-4">
                                        <h3 class="text-lg font-semibold text-black">${horneado.receta.nombre}</h3>
                                        <p class="text-sm text-black mt-1">${horneado.receta.cantidad} pz</p>
                                        <p class="text-sm text-black mt-1">${horneado.estatus} pz</p>
                      </div>
                    </div>
                </div>

                <div class="border-t border-[#8A5114] flex items-center justify-between w-full">
                    <div class="flex justify-center w-1/2">
                        <button onclick="rechazarHorneado(${horneado.id_horneado})" class="w-full justify-center p-1 text-[#8A5114] p-0 cursor-pointer flex flex-nowrap border-r border-[#8A5114] hover:bg-[rgba(145,90,23,0.15)]">
                            RECHAZAR
                        </button>
                    </div>
    
                    <div class="flex justify-center w-1/2">
                      <button onclick="aceptarHorneado(${horneado.id_horneado})" class="w-full justify-center p-1 text-[#8A5114] p-0 cursor-pointer flex flex-nowrap hover:bg-[rgba(145,90,23,0.15)]">
                            ACEPTAR
                      </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function aceptarHorneado(id_horneado){
    alertas.procesoTerminadoExito();
}

function rechazarHorneado(id_horneado){
    alertas.confirmarProcesoFinalizar();
}
window.cargarModuloSolicitudes = cargarModuloSolicitudes;
window.rechazarHorneado = rechazarHorneado;
window.aceptarHorneado = aceptarHorneado;