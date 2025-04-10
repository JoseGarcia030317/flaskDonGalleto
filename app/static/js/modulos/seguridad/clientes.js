import { api } from "../../utils/api.js";
import { tabs } from "../../utils/tabs.js";
import { alertas } from "../../utils/alertas.js";
import { validarCaracteresProhibidos, validarSelectRequerido, mostrarErrores, validarRequerido, validarLongitud, limpiarErrores, validarSoloNumeros, validarLetrasYNumeros, validarTelefono, validarSoloTexto, validarContrasena, validarEmail } from "../../utils/validaciones.js";



// ====================================================================
// Funciones para realizar validaciones del lado del Cliente
// ====================================================================

const validacionesClientes = {
    nombre : (input) => {
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'nombre');
        if (caracteresProhibidos) return caracteresProhibidos;
        const soloTexto = validarSoloTexto(input, 'nombre');
        if (soloTexto) return soloTexto;
        const longitud = validarLongitud(input, 3, 60);
        if (longitud) return longitud;
        return null;
    },
    app : (input) => {
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'apellido paterno');
        if (caracteresProhibidos) return caracteresProhibidos;
        const soloTexto = validarSoloTexto(input, 'apellido paterno');
        if (soloTexto) return soloTexto;
        const longitud = validarLongitud(input, 3, 60);
        if (longitud) return longitud;
        return null;
    },
    apm : (input) => {
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'apelldio materno');
        if (caracteresProhibidos) return caracteresProhibidos;
        const soloTexto = validarSoloTexto(input, 'apellido materno');
        if (soloTexto) return soloTexto;
        const longitud = validarLongitud(input, 3, 60);
        if (longitud) return longitud;
        return null;
    },
    telefono : (input) => {
        const requerido = validarSoloNumeros(input, 'telefono');
        if (requerido) return requerido;
        const telefono = validarTelefono(input);
        if (telefono) return telefono;
        return null;
    },
    regimen : (input) => {
        return validarSelectRequerido(input, 'regimen');
    },
    correo : (input) => {
        const requerido = validarRequerido(input, 'correo');
        if (requerido) return requerido;
        const longitud = validarLongitud(input, 3, 60);
        if (longitud) return longitud;
        const correo = validarEmail(input)
        if (correo) return correo;
        return null;
    },
    contrasenia : (input) => {
        const requerido = validarRequerido(input, 'contraseña');
        if (requerido) return requerido;
        const Contrasena = validarContrasena(input, 'contraseña');
        if (Contrasena) return Contrasena;
        return null;
    },
    razonSocial : (input) => {
        const caracteresProhibidos = validarCaracteresProhibidos(input, 'razon social');
        if (caracteresProhibidos) return caracteresProhibidos;
        const longitud = validarLongitud(input, 3, 60);
        if (longitud) return longitud;
        return null;
    }
}


// ====================================================================
function cargarClientes(){
    obtener_clientes()
}

function obtener_clientes() {
    const tbody = document.getElementById('tbody_clientes');
    tbody.innerHTML = ''; 
    api.getJSON('/clientes/get_all_clientes')
    .then(data => {
        if (data && Array.isArray(data)) {
            data.forEach(cliente => {
                const tr = document.createElement('tr');

                const nombreCompleto = cliente.tipo == 1 ? `${cliente.nombre || ''} ${cliente.apellido_pat || ''} ${cliente.apellido_mat || ''}`.trim() : cliente.empresa;
                const regimen = cliente.tipo == 1 ? 'Persona Fisica' : 'Persona Moral';

                tr.innerHTML = `
                    <td class="p-3 text-center">${nombreCompleto}</td>
                    <td class="p-3 text-center">${cliente.telefono}</td>
                    <td class="p-3 text-center">${regimen || ''}</td>
                    <td class="p-3 text-center">${cliente.correo || ''}</td>
                    <td class="p-3 flex justify-center">
                        <button class="align-middle cursor-pointer" onclick="obtenerClientesById(${cliente.id_cliente})">
                            <img src="../../../static/images/lapiz.png" class="w-7 h-7">
                        </button>
                        <button class="align-middle cursor-pointer" onclick="eliminarClientes(${cliente.id_cliente})">
                            <img src="../../../static/images/bote basura.png" class="w-7 h-7">
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        }  
    })
    .catch(error => {
        Swal.fire('Error', 'Error al cargar los clientes', 'error');
    });
};


function eliminarClientes(id_cliente) {
    alertas.confirmarEliminar()
    .then(resultado => {
        if (!resultado.isConfirmed) {
            return Promise.reject('cancelado');
        }
        return api.postJSON('/clientes/delete_client', {id_cliente : id_cliente});
    })
    .then(data => {
        if (data.id_cliente) {
            alertas.procesoTerminadoExito();
            cargarClientes();
        } else {
            Swal.fire('Error', 'Error al eliminar cliente', 'error');
        }
    })
    .catch(error => {
        if (error !== 'cancelado') {
            Swal.fire('Error', 'Error al cliente', 'error');
        }
    });
};


function guardar_cliente(event){
    event.preventDefault(); 
    const id_cliente = parseInt(document.querySelector('input[name="id_cliente"]').value, 10);
    const esEdicion = id_cliente !== 0;

    const errores = validarFormulario(esEdicion);
    if (errores) {
        mostrarErrores(errores);
        return;
    }

    const formData = {
        nombre : document.querySelector('input[name="nombre"]').value,
        apellido_pat : document.querySelector('input[name="app"]').value,
        apellido_mat : document.querySelector('input[name="apm"]').value,
        empresa : document.querySelector('input[name="razonSocial"]').value,
        telefono : document.querySelector('input[name="telefono"]').value,
        tipo : parseInt(document.getElementById("regimen").value, 10),
        contrasenia : document.querySelector('input[name="contrasenia"]').value,
        correo : document.querySelector('input[name="correo"]').value,
        estatus: 1
    }
        
    // Si es modificar
    let endpoint = id_cliente != 0 ? '/clientes/update_client' : '/clientes/create_client';
    let payload = id_cliente != 0 ? {...formData, id_cliente} : formData;
    
    api.postJSON(endpoint, payload)
        .then(data => {
            if (data.id_cliente) {
                cerrarModal();
                alertas.procesoTerminadoExito();
                obtener_clientes();
                limpiarFormulario();
            } else {
                alert('Error al guardar el cliente: ' + (data.error || 'Error desconocido'));
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Error al guardar cliente', 'error');
        })
    
};

function obtenerClientesById(id_cliente){
    api.postJSON('/clientes/update_client', { id_cliente : id_cliente })
        .then(data => {
            if (data.id_cliente) {
                document.getElementById('regimen').disabled = true;
                
                abrirModal('editar');
                llenarFormularioEdicion(data);
                manejarRegimen();
            } else {
                alert('Cliente no encontrado: ' + (data.error || 'Error desconocido'));
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Error al obtener cliente', 'error');
        });
}

// ====================================================================
// Funciones para manejar el DOM y mostrar modales y alertas
// ====================================================================
function filtrarTabla() {
    const textoBusqueda = document.querySelector('input[name="buscar"]').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody_clientes tr');
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();

        if (textoFila.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
};

function abrirModal(tipo) {
    const backdrop = document.getElementById('modalBackdrop');
    const modalForm = document.getElementById('modalForm');
    manejarRegimen();
    backdrop.classList.remove('hidden');

    tipo === 'editar' 
        ? document.getElementById('contrasenia').closest('div').style.display = 'none' 
        : document.getElementById('contrasenia').closest('div').style.display = 'block';

    document.getElementById('modalTitulo').textContent =
        tipo === 'editar' ? 'Editar Cliente' : 'Registrar Cliente';
    modalForm.classList.remove('hidden');
};

function cerrarModal() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    document.getElementById('modalForm').classList.add('hidden');
    limpiarFormulario();
    document.getElementById('regimen').disabled = false;
};

function limpiarFormulario(){
    document.querySelector('input[name="id_cliente"]').value = 0;
    document.querySelector('input[name="nombre"]').value = '',
    document.querySelector('input[name="app"]').value = '',
    document.querySelector('input[name="apm"]').value = '',
    document.querySelector('input[name="razonSocial"]').value = '',
    document.querySelector('input[name="telefono"]').value = '',
    document.querySelector('input[name="correo"]').value = '',
    document.querySelector('input[name="contrasenia"]').value = '',
    document.getElementById("regimen").value = "0";
    limpiarErrores();
}

function llenarFormularioEdicion(data) {
    document.querySelector('#clienteForm input[name="id_cliente"]').value = data.id_cliente || '';
    document.querySelector('#clienteForm input[name="nombre"]').value = data.nombre || '';
    document.querySelector('#clienteForm input[name="app"]').value = data.apellido_pat || '';
    document.querySelector('#clienteForm input[name="apm"]').value = data.apellido_mat || '';
    document.querySelector('#clienteForm input[name="razonSocial"]').value = data.empresa || '';
    document.querySelector('#clienteForm input[name="telefono"]').value = data.telefono || '';
    document.querySelector('#clienteForm input[name="correo"]').value = data.correo || '';
    document.querySelector('#clienteForm input[name="contrasenia"]').value = '';
    const selectRegimen = document.querySelector('#clienteForm select[name="regimen"]');
    selectRegimen.value = data.tipo || '0';

};


function validarFormulario(esEdicion = false) {
    const validacion = {
        nombre : document.querySelector('input[name="nombre"]').value,
        app : document.querySelector('input[name="app"]').value,
        apm : document.querySelector('input[name="apm"]').value,
        telefono : document.querySelector('input[name="telefono"]').value,
        regimen : document.getElementById('regimen').value,
        correo : document.querySelector('input[name="correo"]').value,
        razonSocial: document.querySelector('input[name="razonSocial"]').value,
        contrasenia : esEdicion ? '' : document.querySelector('input[name="contrasenia"]').value // Si es edición, no validamos contrasenia
    }

    const errores = {};
    const regimenSeleccionado = parseInt(validacion.regimen, 10);
    if (regimenSeleccionado === 1) { 
        // Para persona física: validar todos los campos excepto razonSocial
        const camposValidar = ["nombre", "app", "apm", "telefono", "correo", "contrasenia"];
        camposValidar.forEach(campo => {
            if (campo === "contrasenia" && esEdicion) return; // Si es edición, omitir validación de la contraseña
            const error = validacionesClientes[campo](validacion[campo]);
            if (error) {
                errores[campo] = error;
            }
        });
    } else if (regimenSeleccionado === 2) { 
        // Para persona moral: validar todos los campos excepto nombre, app, apm
        const camposValidar = ["razonSocial", "telefono", "correo", "contrasenia"];
        camposValidar.forEach(campo => {
            if (campo === "contrasenia" && esEdicion) return; // Si es edición, omitir validación de la contraseña
            const error = validacionesClientes[campo](validacion[campo]);
            if (error) {
                errores[campo] = error;
            }
        });
    }
    

    return Object.keys(errores).length === 0 ? null : errores;
}



function manejarRegimen() {
    const regimenSeleccionado = parseInt(document.getElementById("regimen").value, 10);

    // Campos que solo son relevantes para "Persona Física"
    const nombre = document.querySelector('input[name="nombre"]');
    const apellidoPaterno = document.querySelector('input[name="app"]');
    const apellidoMaterno = document.querySelector('input[name="apm"]');
    
    // Campos que solo son relevantes para "Persona Moral"
    const razonSocial = document.querySelector('input[name="razonSocial"]');

    if (regimenSeleccionado === 1) { // Persona Física
        // Mostrar campos de persona física y requerirlos
        nombre.parentElement.style.display = "block";
        apellidoPaterno.parentElement.style.display = "block";
        apellidoMaterno.parentElement.style.display = "block";

        razonSocial.parentElement.style.display = "none"; // Ocultar "Razon Social"

        // Añadir "required" a los campos de persona física
        nombre.setAttribute("required", "true");
        apellidoPaterno.setAttribute("required", "true");
        apellidoMaterno.setAttribute("required", "true");

        // Eliminar "required" de los campos de persona moral
        razonSocial.removeAttribute("required");
    } else if (regimenSeleccionado === 2) { // Persona Moral
        // Mostrar campos de persona moral y requerirlos
        razonSocial.parentElement.style.display = "block"; // Mostrar "Razon Social"
        
        // Ocultar campos de persona física
        nombre.parentElement.style.display = "none";
        apellidoPaterno.parentElement.style.display = "none";
        apellidoMaterno.parentElement.style.display = "none";

        // Añadir "required" a los campos de persona moral
        razonSocial.setAttribute("required", "true");

        // Eliminar "required" de los campos de persona física
        nombre.removeAttribute("required");
        apellidoPaterno.removeAttribute("required");
        apellidoMaterno.removeAttribute("required");
    } else {
        // Si no se ha seleccionado un régimen, ocultar todo
        nombre.parentElement.style.display = "none";
        apellidoPaterno.parentElement.style.display = "none";
        apellidoMaterno.parentElement.style.display = "none";
        razonSocial.parentElement.style.display = "none";
        
        // Eliminar "required" de todos los campos
        nombre.removeAttribute("required");
        apellidoPaterno.removeAttribute("required");
        apellidoMaterno.removeAttribute("required");
        razonSocial.removeAttribute("required");
    }
}

window.onload = function() {
    manejarRegimen(); // Llamar a manejarRegimen cuando la página se carga
};

// Escuchamos el cambio del select para ajustar los campos
document.getElementById("regimen").addEventListener("change", manejarRegimen);


window.cargarClientes = cargarClientes;
window.obtener_clientes = obtener_clientes;
window.eliminarClientes = eliminarClientes;
window.obtenerClientesById = obtenerClientesById;
window.guardar_cliente = guardar_cliente;

window.filtrarTabla = filtrarTabla;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;