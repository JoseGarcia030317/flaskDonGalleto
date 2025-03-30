function cargarGraficasDashboard(){
    GraficaVentasDiarias();
    GraficaProMasVendidos();
    GraficaPreMasVendidos();
}

function GraficaVentasDiarias(){
    const ctx = document.getElementById('ventasDiarias');

    if (!ctx) {
        console.error("Error: No se encontró el elemento con id 'myChart'");
        return;
    }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Entrada Dinero', 'Salida Dinero'],
            datasets: [{
                label: '# de Ventas',
                data: [12, 19],
                backgroundColor: ['#efe6dc', '#bf9578'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function GraficaProMasVendidos(){
    const ctx = document.getElementById('ProMasVendidos');

    if (!ctx) {
        console.error("Error: No se encontró el elemento con id 'myChart'");
        return;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: 'Pro Mas Vendidas',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: ['red', 'blue', 'yellow', 'green', 'purple', 'orange'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function GraficaPreMasVendidos(){
    const ctx = document.getElementById('PreMasVendidos');

    if (!ctx) {
        console.error("Error: No se encontró el elemento con id 'myChart'");
        return;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# Pre Mas vendidas',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: ['red', 'blue', 'yellow', 'green', 'purple', 'orange'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

window.cargarGraficasDashboard = cargarGraficasDashboard;
window.GraficaVentasDiarias = GraficaVentasDiarias;
window.GraficaProMasVendidos = GraficaProMasVendidos;
window.GraficaPreMasVendidos = GraficaPreMasVendidos;