import { api } from '../../utils/api.js';
import { tabs } from '../../utils/tabs.js';
import { alertas } from '../../utils/alertas.js';


function cargarModuloSolicitudes(){
    generarCards();
}

function generarCards() {
    const container = document.getElementById('solicitudes-container');
    tabs.mostrarEsqueletoCardGalleta(container);
    api.postJSON('horneado/get_horneado_by_id', {state: 4})
    .then(horneados => {
        container.innerHTML = "";
        if(horneados.length > 0){

            horneados.forEach(horneado => {
                const card = document.createElement('div');
                card.className = 'bg-[#efe6dc] rounded-xl shadow-md overflow-hidden border border-gray-200';
                card.innerHTML = `
                <div class="flex flex-col relative h-auto">
                <span class="absolute top-2 right-2 w-5 h-5 bg-yellow-500 rounded-full"></span>
                <div class="flex items-center h-32">
                <div class="w-1/3 flex items-center justify-center">
                <img src="../../../static/images/galleta ejemplo.png" 
                alt="galleta" 
                class="h-24 w-24 pl-2 object-contain">
                </div>
                
                <div class="flex items-center h-32">
                <div class="max-w-60 pl-4">
                <h3 class="text-lg font-semibold text-black">${horneado.receta.nombre}</h3>
                <p class="text-sm text-black mt-1">${horneado.receta.cantidad} pz</p>
                <p class="text-sm text-black mt-1">${horneado.receta.tiempo} min | ${horneado.estatus}</p>
                </div>
                </div>
                </div>
                
                <div class="border-t border-[#8A5114] flex items-center justify-between w-full">
                <div class="flex justify-center w-1/2">
                <button onclick="rechazarHorneado(${horneado.id_horneado})" class="w-full justify-center p-1 text-[#8A5114] cursor-pointer flex flex-nowrap border-r border-[#8A5114] hover:bg-[rgba(145,90,23,0.15)]">
                RECHAZAR
                </button>
                </div>
                
                <div class="flex justify-center w-1/2">
                <button onclick="aceptarHorneado(${horneado.id_horneado})" class="w-full justify-center p-1 text-[#8A5114] cursor-pointer flex flex-nowrap hover:bg-[rgba(145,90,23,0.15)]">
                ACEPTAR
                </button>
                </div>
                </div>
                </div>
                `;
                
                container.appendChild(card);
            });
        } else {
            document.getElementById('main-container').innerHTML = `
                    <div class="flex justify-center items-center h-full">
                        <p class="text-gray-500 font-medium text-xl">No hay solicitudes pendientes</p>
                    </div>
                `;
        }
    });
}

function aceptarHorneado(id_horneado){
    tabs.mostrarLoader();
    api.postJSON('horneado/preparar_horneado', {id_horneado: id_horneado})
    .then(respuesta => {
        if(respuesta.id_horneado){
            alertas.procesoTerminadoExito();
            cargarModuloSolicitudes();
        } else if(respuesta.estatus === 404 || respuesta.estatus === 400){
            alertas.alertaWarning(respuesta.message);
        } else {
            alertas.procesoTerminadoSinExito();
        }
    })
    .catch(error => {
        Swal.fire('Error', 'Error al finalizar horneado', 'error');
    })
    .finally(() => tabs.ocultarLoader());
}

function rechazarHorneado(id_horneado){
    tabs.mostrarLoader();
    api.postJSON('horneado/rechazar_horneado', {id_horneado: id_horneado})
    .then(respuesta => {
        if(respuesta.id_horneado){
            alertas.procesoTerminadoExito();
            cargarModuloSolicitudes();
        } else if (respuesta.estatus === 404){
            alertas.alertaWarning(respuesta.message);
        } else {
            alertas.procesoTerminadoSinExito();
        }
    })
    .catch(error => {
        Swal.fire('Error', 'Error al finalizar horneado', 'error');
    })
    .finally(() => tabs.ocultarLoader());
}

window.cargarModuloSolicitudes = cargarModuloSolicitudes;
window.rechazarHorneado = rechazarHorneado;
window.aceptarHorneado = aceptarHorneado;