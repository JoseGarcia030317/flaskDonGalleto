import { api } from '../../utils/api.js';

function cargarGraficasDashboard(){
    GraficaProMasVendidos();
    GraficaPreMasVendidos();
    GraficaCostoGalleta();
    GalletaRecomendada();
    GraficaVentasSemana();
}
/* 
function GraficaVentasDiarias(){
    api.getJSON('/dashboard/get_daily_sales')
    .then(data => {
        const ctx = document.getElementById('ventasDiarias');

        if (!ctx) {
            console.error("Error: No se encontró el elemento con id 'ventasDiarias'");
            toggleCardDisplay('cardVentasDiarias', 'cardErrorVentasDiarias', true);
            return;
        }

        if (data && Array.isArray(data) && data.length > 0) {
            let totalCompras = 0;
            let totalEntrada = 0;
            let totalSalidaConCompra = 0;
            
            // Recorremos los datos y sumamos según el tipo
            data.forEach(item => {
                if (item.tipo === 'compras') {
                    totalCompras = item.resultado.total_compras;
                }
                if (item.tipo === 'ventas') {
                    totalEntrada = item.resultado.total_entrada;
                    totalSalidaConCompra = item.resultado.total_salida + totalCompras;
                }
            });

            if (totalEntrada === 0 && totalSalidaConCompra === 0) {
                // No hay datos que mostrar, se muestra mensaje de error
                toggleCardDisplay('cardVentasDiarias', 'cardErrorVentasDiarias', true);
                return;
            }

            toggleCardDisplay('cardVentasDiarias', 'cardErrorVentasDiarias', false);

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Entrada Dinero', 'Salida Dinero'],
                    datasets: [{
                        label: '$ ',
                        data: [totalEntrada, totalSalidaConCompra],
                        backgroundColor: ['#efe6dc', '#bf9578'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                },
            });
            
        } else {
            console.error("Error: Datos recibidos no válidos o vacíos.");
            toggleCardDisplay('cardVentasDiarias', 'cardErrorVentasDiarias', true);
        }
    })
    .catch(error => {
        console.error("Error al obtener los datos del API:", error);
        toggleCardDisplay('cardVentasDiarias', 'cardErrorVentasDiarias', true);
    });
}
*/
function GraficaProMasVendidos() {
    api.getJSON('/dashboard/best_selling_product')
        .then(data => {
            if (data && Array.isArray(data)) {

                const labels = data.map(item => item.product_name);
                const quantities = data.map(item => item.quantity);
                const amounts = data.map(item => item.amount);

                const backgroundColors = [
                    '#bf9578',
                    '#b27c5d', 
                     '#a46a52', 
                     '#895645', 
                     '#6f473d', 
                 ];
                  
                  const borderColors = [
                    '#bf9578',
                    '#b27c5d', 
                     '#a46a52', 
                     '#895645', 
                     '#6f473d', 
                  ];

                const ctx = document.getElementById('PreMasVendidos');

                if (!ctx) {
                    console.error("Error: No se encontró el elemento con id 'PreMasVendidos'");
                    return;
                }

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Productos Más Vendidos',
                            data: amounts,
                            backgroundColor: backgroundColors,
                            borderColor: borderColors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Monto en MXN'
                                },
                                ticks: {
                                    callback: function(value) {
                                        return value.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        });
                                    }
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    // Título: nombre del producto
                                    title: function(context) {
                                        return context[0].label;
                                    },
                                    // Cuerpo del tooltip con varios datos
                                    label: function(context) {
                                        const index = context.dataIndex;
                        
                                        const value = context.parsed.y.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        });
                        
                                        const qty = quantities[index];
                        
                                        return [
                                            `${context.dataset.label}: ${value}`,
                                            `Cantidad: ${qty}`,
                                        ];
                                    }
                                }
                            }
                        }
                        
                    }
                });
            } else {
                console.error("Error: Datos recibidos no válidos.");
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos del API:", error);
        });
};


function GraficaPreMasVendidos(){
    api.getJSON('/dashboard/best_selling_presentations')
    .then(data => {
        if (data && Array.isArray(data)) {

            const labels = data.map(item => item.presentation_name);
            const quantities = data.map(item => item.quantity);
            const quantities_cookies = data.map(item => item.quantity_cookie);
            const amounts = data.map(item => item.amount);

            const backgroundColors = [
                '#bf9578',
                '#b27c5d', 
                '#a46a52', 
                '#895645', 
                '#6f473d', 

              ];
              
              const borderColors = [
                '#bf9578',
                '#b27c5d', 
                '#a46a52', 
                '#895645', 
                '#6f473d', 
              ];

            const ctx = document.getElementById('ProMasVendidos');

            if (!ctx) {
                console.error("Error: No se encontró el elemento con id 'ProMasVendidos'");
                return;
            }

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Presentaciones Más Vendidas',
                        data: amounts,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Monto en MXN'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD'
                                    });
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                title: function (context) {
                                    return context[0].label;
                                },
                                label: function (context) {
                                    const index = context.dataIndex;
                                    const value = context.parsed.y.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD'
                                    });
                    
                                    const qty = quantities[index];
                                    const qtyCookies = quantities_cookies[index];
                    
                                    return [
                                        `${context.dataset.label}: ${value}`,
                                        `Cantidad: ${qty}`,
                                        `Cantidad Galletas: ${qtyCookies}`
                                    ];
                                }
                            }
                        }
                    }
                    
                }
            });
        } else {
            console.error("Error: Datos recibidos no válidos.");
        }
    })
    .catch(error => {
        console.error("Error al obtener los datos del API:", error);
    });
};

function GraficaCostoGalleta() {
    api.getJSON('/dashboard/cost_per_cookie')
        .then(data => {
            if (data && Array.isArray(data)) {

                const labels = data.map(item => item.cookie_name);
                const amounts = data.map(item => item.amount);
                const unit_price = data.map(item => item.unit_price )


                const backgroundColors = [
                   '#bf9578',
                    '#b27c5d', 
                    '#a46a52', 
                    '#895645', 
                    '#6f473d', 
                ];

                const ctx = document.getElementById('CostoGalleta');

                if (!ctx) {
                    console.error("Error: No se encontró el elemento con id 'CostoGalleta'");
                    return;
                }

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                type: 'bar',
                                label: 'Costo por Galleta',
                                data: amounts,
                                backgroundColor: backgroundColors,
                                borderColor: backgroundColors,
                                borderWidth: 1
                            },
                            {
                                type: 'line',
                                label: 'Precio Unitario Galleta',
                                data: unit_price,
                                borderColor: '#4b2e2e',
                                backgroundColor: 'rgba(0,0,0,0)',
                                tension: 0.3,
                                fill: false,
                                pointBorderColor:'#5b3b33' ,
                                pointBackgroundColor: '#5b3b33',
                                pointRadius: 5
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Monto en MXN'
                                },
                                ticks: {
                                    callback: function(value) {
                                        return value.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        });
                                    }
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    title: function (context) {
                                        return context[0].label;
                                    },
                                    label: function (context) {
                                        const value = context.parsed.y.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        });
                                        return `${context.dataset.label}: ${value}`;
                                    }
                                }
                            }
                        }
                    }
                });
            } else {
                console.error("Error: Datos recibidos no válidos.");
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos del API:", error);
        });
};

function GraficaVentasSemana() {

    api.getJSON('/dashboard/weekly_sales')
        .then(data => {
            if (data && Array.isArray(data)) { 
            const labels = data.map(item => item.date); 
            const salesData = data.map(item => item.sales); 
            const total = Number(data[0].total); 

            const formatoTotal = total.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            const ctx = document.getElementById('VentasSemana');

            new Chart(ctx, {
                type: 'line', 
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ventas de la Semana',
                        data: salesData,
                        borderColor: '#895645',  
                        backgroundColor: '#bf9578', 
                        fill: true,  
                        tension: 0.3,  
                        pointBorderColor:'#5b3b33' ,
                        pointBackgroundColor: '#5b3b33',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Ventas en MXN'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();  
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Fechas'
                            },
                            ticks: {
                                autoSkip: true, 
                                maxRotation: 45, 
                                minRotation: 45
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                title: function(context) {
                                    return context[0].label;
                                },
                                label: function (context) {
                                    const value = context.parsed.y.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD'
                                    });
                                    return `${context.dataset.label}: ${value}`;
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: `Total Ventas: ${formatoTotal}`,
                            font: {
                                size: 16
                            }
                        },
                    }
                }
            });

            } else {
                console.error("Error: Datos recibidos no válidos.");
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos del API:", error);
        });
   
}


function GalletaRecomendada() {
    api.getJSON('/dashboard/profit_margin')
    .then(data => {
        let contenidoHTML = `
            <li><strong>Galleta recomendada:</strong> Sin datos</li>
            <li><strong>Margen de utilidad:</strong> Sin datos</li>
            <li><strong>Existencias actuales:</strong> Sin datos</li>
        `;

        if (data && Array.isArray(data) && data.length > 0) {
            const galleta = data[0];
            const nombreGalleta = galleta.cookie_name || 'Sin datos';
            const margenUtilidad = galleta.margin != null 
            ? Number(galleta.margin).toFixed(2) 
            : 'Sin datos';
            const existencias = galleta.stock ?? 'Sin datos';

            contenidoHTML = `
                <li><strong>Galleta recomendada:</strong> ${nombreGalleta}</li>
                <li><strong>Margen de utilidad:</strong> ${margenUtilidad} %</li>
                <li><strong>Existencias actuales:</strong> ${existencias}</li>
            `;
        }

        document.querySelector('ul').innerHTML = contenidoHTML;
    })
    .catch(error => {
        console.error("Error al obtener los datos del API:", error);
        document.querySelector('ul').innerHTML = `
            <li><strong>Galleta recomendada:</strong> Sin datos</li>
            <li><strong>Margen de utilidad:</strong> Sin datos</li>
            <li><strong>Existencias actuales:</strong> Sin datos</li>
        `;
    });
}


window.cargarGraficasDashboard = cargarGraficasDashboard;
//window.GraficaVentasDiarias = GraficaVentasDiarias;
window.GraficaProMasVendidos = GraficaProMasVendidos;
window.GraficaPreMasVendidos = GraficaPreMasVendidos;
window.GraficaCostoGalleta = GraficaCostoGalleta;
window.GalletaRecomendada = GalletaRecomendada;
window.GraficaVentasSemana = GraficaVentasSemana;