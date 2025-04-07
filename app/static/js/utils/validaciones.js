// Función para validar longitud de un campo
export function validarLongitud(input, min, max) {
    const valor = input || '';

    if (valor.length < min) {
        return `Debe tener al menos ${min} caracteres`;
    }
    if (valor.length > max) {
        return `No debe exceder ${max} caracteres`;
    }
    return null;
}

// Función para validar si un campo es requerido
export function validarRequerido(input, campo) {
    if (!input || input.trim() === '') {
        return `El campo ${campo} es requerido`;
    }
    return null;
}

// Función para validar formato de teléfono
export function validarTelefono(input) {
    const regex = /^\d{10}$/;
    if (!regex.test(input)) {
        return 'El teléfono debe tener 10 dígitos';
    }
    return null;
}

// Función para validar formato de correo electrónico
export function validarEmail(input) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (input && !regex.test(input)) {
        return 'Formato de correo electrónico inválido';
    }
    return null;
}

// Función para validar si un campo permite números
export function validarSoloTexto(input, campo) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (input && !regex.test(input)) {
        return `El campo ${campo} solo permite texto`;
    }
    return null;
}

// Función para validar que un campo solo contenga números
export function validarSoloNumeros(input, campo) {
    const regex = /^\d+$/;
    if (input && !regex.test(input)) {
        return `El campo ${campo} solo permite números enteros`;
    }
    return null;
}

// Funcion para validar que un campo contenga numero decimal
export function validarNumeroDecimal(input, campo) {
    const regex = /^[0-9]*\.?[0-9]+$/;
    if (input && !regex.test(input)) {
        return `El campo ${campo} debe ser un número decimal válido`;
    }
    return null;
}

// Función para bloquear caracteres peligrosos
export function validarCaracteresProhibidos(input, campo) {
    const regex = /[<>'"\\]/;
    if (input && regex.test(input)) {
        return `El campo ${campo} tiene caracteres invalidos`;
    }
    return null;
}

export function validarSelectRequerido(input, campo) {
    if (!input || input.trim() === '' || input === '0') {
        return `El campo ${campo} es requerido`;
    }
    return null;
}

// Función para validar letras, números y espacios
export function validarLetrasYNumeros(input, campo) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/;
    if (input && !regex.test(input)) {
        return `El campo ${campo} solo permite letras, números y espacios`;
    }
    return null;
}

export function validarContrasena(input, campo) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (input && !regex.test(input)) {
        return `${campo} debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial (!@#$%^&*)`;
    }
    return null;
}

export function mostrarErrores(errores) {
    document.querySelectorAll('.error-message').forEach(span => span.classList.add('hidden'));
    Object.keys(errores).forEach(campo => {
        const input = document.querySelector(`[name="${campo}"]`);
        if (!input) {
            console.error(`No se encontró el campo: ${campo}`);
            return;
        }
        const errorSpan = input.nextElementSibling;
        if (!errorSpan || !errorSpan.classList.contains('error-message')) {
            console.error(`No se encontró el mensaje de error para el campo: ${campo}`);
            return;
        }
        errorSpan.textContent = errores[campo];
        errorSpan.classList.remove('hidden');
    });
}

export function limpiarErrores() {
    document.querySelectorAll('.error-message').forEach(span => {
        span.classList.add('hidden');
        span.textContent = '';
    });
}

export function convertirFecha(fecha){
    return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}