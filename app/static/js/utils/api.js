// Función para manejar errores y respuestas
const handleResponse = async (response) => {
    // Manejar error 403 (Forbidden)
    if (response.status === 403) {
        Swal.fire({
            icon: 'warning',
            title: 'Acceso denegado',
            text: 'No tienes permisos para este recurso',
            showConfirmButton: true
        }).then(() => {
            window.location.href = "/login";
        });
        return Promise.reject("Acceso denegado");
    }

    // Manejar otros errores HTTP
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error HTTP: ${response.status}`);
    }

    return response;
};

// Headers comunes para JSON
const getJSONHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
});

// Función genérica para peticiones JSON
const fetchJSON = (url, method = 'GET', data = null) => {
    return fetch(url, {
        method: method.toUpperCase(),
        headers: getJSONHeaders(),
        body: data ? JSON.stringify(data) : null,
    })
    .then(handleResponse)
    .then(response => response.json());
};

// Función genérica para peticiones HTML
const fetchHTML = (url) => {
    return fetch(url, {
        headers: { 'Accept': 'text/html' }
    })
    .then(handleResponse)
    .then(response => response.text());
};

// Exportar variable api
export const api = {
    // JSON
    getJSON: (url) => fetchJSON(url, 'GET'),
    postJSON: (url, data) => fetchJSON(url, 'POST', data),
    putJSON: (url, data) => fetchJSON(url, 'PUT', data),
    delJSON: (url) => fetchJSON(url, 'POST'),

    // HTML
    getHTML: (url) => fetchHTML(url)
};