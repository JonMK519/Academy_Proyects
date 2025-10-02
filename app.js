// ====================================
// Analizador de Casos de Negocio Pro - JS Principal
// Motor Completo de Análisis Financiero
// ====================================

// Global state
let projectData = null;
let charts = {
    cashflow: null,
    roi: null,
    scenarios: null
};

// Financial Calculation Functions
const FinancialCalculator = {
    // Calculate ROI (Return on Investment)
    calculateROI(investment, totalReturn) {
        if (investment === 0) return 0;
        return ((totalReturn - investment) / investment) * 100;
    },

    // Calculate NPV (Net Present Value)
    calculateNPV(cashFlows, discountRate) {
        let npv = 0;
        for (let i = 0; i < cashFlows.length; i++) {
            npv += cashFlows[i] / Math.pow(1 + discountRate / 100, i + 1);
        }
        return npv;
    },

    // Calculate Payback Period (in months)
    calculatePaybackPeriod(initialInvestment, monthlyCashFlows) {
        let cumulativeCashFlow = -initialInvestment;
        for (let i = 0; i < monthlyCashFlows.length; i++) {
            cumulativeCashFlow += monthlyCashFlows[i];
            if (cumulativeCashFlow >= 0) {
                // Interpolate to get more precise payback period
                const previousCumulativeCashFlow = cumulativeCashFlow - monthlyCashFlows[i];
                const fraction = -previousCumulativeCashFlow / monthlyCashFlows[i];
                return i + fraction;
            }
        }
        return monthlyCashFlows.length; // Didn't break even within project duration
    },

    // Calculate IRR (Internal Rate of Return) using Newton-Raphson method
    calculateIRR(cashFlows, initialGuess = 0.1) {
        const maxIterations = 100;
        const tolerance = 0.0001;
        let rate = initialGuess;

        for (let i = 0; i < maxIterations; i++) {
            let npv = 0;
            let dnpv = 0;

            for (let j = 0; j < cashFlows.length; j++) {
                const denominator = Math.pow(1 + rate, j);
                npv += cashFlows[j] / denominator;
                dnpv -= j * cashFlows[j] / (denominator * (1 + rate));
            }

            const newRate = rate - npv / dnpv;
            if (Math.abs(newRate - rate) < tolerance) {
                return newRate * 100; // Convert to percentage
            }
            rate = newRate;
        }
        return rate * 100;
    },

    // Generate cash flow projections
    generateCashFlows(data) {
        const monthlyRevenue = data.yearlyRevenue / 12;
        const monthlyCosts = (data.operatingCosts + data.maintenanceCosts) / 12;
        const monthlyGrowthRate = Math.pow(1 + data.revenueGrowth / 100, 1 / 12) - 1;
        
        const cashFlows = [];
        cashFlows.push(-data.initialInvestment); // Initial investment (negative)

        for (let month = 1; month <= data.projectDuration; month++) {
            const growthFactor = Math.pow(1 + monthlyGrowthRate, month - 1);
            const revenue = monthlyRevenue * growthFactor;
            const netCashFlow = revenue - monthlyCosts;
            cashFlows.push(netCashFlow);
        }

        return cashFlows;
    },

    // Calculate comprehensive metrics
    calculateMetrics(data) {
        const cashFlows = this.generateCashFlows(data);
        const monthlyCashFlows = cashFlows.slice(1); // Exclude initial investment
        
        const totalRevenue = monthlyCashFlows.reduce((sum, cf) => sum + cf, 0);
        const roi = this.calculateROI(data.initialInvestment, totalRevenue);
        const npv = this.calculateNPV(monthlyCashFlows, data.discountRate);
        const paybackPeriod = this.calculatePaybackPeriod(data.initialInvestment, monthlyCashFlows);
        const irr = this.calculateIRR(cashFlows);

        return {
            roi,
            npv,
            paybackPeriod,
            irr,
            cashFlows,
            totalRevenue
        };
    }
};

// UI Update Functions
const UIUpdater = {
    updateDashboard(metrics) {
        document.getElementById('roi-value').textContent = metrics.roi.toFixed(2) + '%';
        document.getElementById('npv-value').textContent = '$' + metrics.npv.toLocaleString('es-ES', { maximumFractionDigits: 0 });
        document.getElementById('payback-value').textContent = metrics.paybackPeriod.toFixed(1);
        document.getElementById('irr-value').textContent = metrics.irr.toFixed(2) + '%';

        // Update status messages
        document.getElementById('roi-status').textContent = metrics.roi > 0 ? '✓ Retorno positivo' : '✗ Retorno negativo';
        document.getElementById('npv-status').textContent = metrics.npv > 0 ? '✓ Genera valor' : '✗ Destruye valor';
    },

    updateScenarioCards(expectedMetrics, bestMetrics, worstMetrics) {
        // Expected case
        document.getElementById('expected-roi').textContent = expectedMetrics.roi.toFixed(2) + '%';
        document.getElementById('expected-npv').textContent = '$' + expectedMetrics.npv.toLocaleString('es-ES', { maximumFractionDigits: 0 });
        document.getElementById('expected-payback').textContent = expectedMetrics.paybackPeriod.toFixed(1) + ' meses';

        // Best case
        document.getElementById('best-roi').textContent = bestMetrics.roi.toFixed(2) + '%';
        document.getElementById('best-npv').textContent = '$' + bestMetrics.npv.toLocaleString('es-ES', { maximumFractionDigits: 0 });
        document.getElementById('best-payback').textContent = bestMetrics.paybackPeriod.toFixed(1) + ' meses';

        // Worst case
        document.getElementById('worst-roi').textContent = worstMetrics.roi.toFixed(2) + '%';
        document.getElementById('worst-npv').textContent = '$' + worstMetrics.npv.toLocaleString('es-ES', { maximumFractionDigits: 0 });
        document.getElementById('worst-payback').textContent = worstMetrics.paybackPeriod.toFixed(1) + ' meses';
    },

    showMessage(type, message) {
        const messageDiv = document.getElementById('formMessage');
        messageDiv.className = `alert ${type}`;
        messageDiv.textContent = message;
        messageDiv.classList.remove('hidden');
        
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    },

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
};

// Chart Management
const ChartManager = {
    createCashFlowChart(cashFlows, duration) {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded. Skipping chart creation.');
            return;
        }
        
        const ctx = document.getElementById('cashflowChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (charts.cashflow) {
            charts.cashflow.destroy();
        }

        // Calculate cumulative cash flow
        const cumulativeCashFlow = [];
        let cumulative = 0;
        cashFlows.forEach(cf => {
            cumulative += cf;
            cumulativeCashFlow.push(cumulative);
        });

        const labels = ['Start', ...Array.from({ length: duration }, (_, i) => `M${i + 1}`)];

        charts.cashflow = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Flujo de Caja Mensual',
                    data: cashFlows,
                    borderColor: 'rgba(131, 56, 236, 1)',
                    backgroundColor: 'rgba(131, 56, 236, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Flujo de Caja Acumulado',
                    data: cumulativeCashFlow,
                    borderColor: 'rgba(57, 255, 20, 1)',
                    backgroundColor: 'rgba(57, 255, 20, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Análisis de Flujo de Caja en el Tiempo',
                        font: { size: 18, weight: 'bold' },
                        color: '#ffffff'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#ffffff', font: { size: 12 } }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '$' + context.parsed.y.toLocaleString('es-ES', { maximumFractionDigits: 0 });
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-ES');
                            },
                            color: '#ffffff'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    },

    createROIChart(expectedROI, bestROI, worstROI) {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded. Skipping chart creation.');
            return;
        }
        
        const ctx = document.getElementById('roiChart').getContext('2d');
        
        if (charts.roi) {
            charts.roi.destroy();
        }

        charts.roi = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Caso Esperado', 'Mejor Caso', 'Peor Caso'],
                datasets: [{
                    label: 'ROI (%)',
                    data: [expectedROI, bestROI, worstROI],
                    backgroundColor: [
                        'rgba(0, 217, 255, 0.8)',
                        'rgba(57, 255, 20, 0.8)',
                        'rgba(255, 0, 110, 0.8)'
                    ],
                    borderColor: [
                        'rgba(0, 217, 255, 1)',
                        'rgba(57, 255, 20, 1)',
                        'rgba(255, 0, 110, 1)'
                    ],
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparación de ROI entre Escenarios',
                        font: { size: 18, weight: 'bold' },
                        color: '#ffffff'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'ROI: ' + context.parsed.y.toFixed(2) + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            color: '#ffffff'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    },

    createScenariosChart(expectedMetrics, bestMetrics, worstMetrics) {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded. Skipping chart creation.');
            return;
        }
        
        const ctx = document.getElementById('scenariosChart').getContext('2d');
        
        if (charts.scenarios) {
            charts.scenarios.destroy();
        }

        charts.scenarios = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['ROI', 'VPN (escalado)', 'Período Recuperación (inv)', 'TIR'],
                datasets: [{
                    label: 'Caso Esperado',
                    data: [
                        expectedMetrics.roi,
                        expectedMetrics.npv / 1000,
                        100 / (expectedMetrics.paybackPeriod || 1),
                        expectedMetrics.irr
                    ],
                    borderColor: 'rgba(0, 217, 255, 1)',
                    backgroundColor: 'rgba(0, 217, 255, 0.3)',
                    borderWidth: 3
                }, {
                    label: 'Mejor Caso',
                    data: [
                        bestMetrics.roi,
                        bestMetrics.npv / 1000,
                        100 / (bestMetrics.paybackPeriod || 1),
                        bestMetrics.irr
                    ],
                    borderColor: 'rgba(57, 255, 20, 1)',
                    backgroundColor: 'rgba(57, 255, 20, 0.3)',
                    borderWidth: 3
                }, {
                    label: 'Peor Caso',
                    data: [
                        worstMetrics.roi,
                        worstMetrics.npv / 1000,
                        100 / (worstMetrics.paybackPeriod || 1),
                        worstMetrics.irr
                    ],
                    borderColor: 'rgba(255, 0, 110, 1)',
                    backgroundColor: 'rgba(255, 0, 110, 0.3)',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Análisis Multi-Dimensional de Escenarios',
                        font: { size: 18, weight: 'bold' },
                        color: '#ffffff'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#ffffff', font: { size: 12 } }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: { color: '#ffffff', backdropColor: 'transparent' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' },
                        pointLabels: { color: '#ffffff', font: { size: 12 } }
                    }
                }
            }
        });
    }
};

// Recommendation Engine
const RecommendationEngine = {
    generateRecommendations(expectedMetrics, bestMetrics, worstMetrics, data) {
        const recommendations = [];

        // ROI Analysis
        if (expectedMetrics.roi > 50) {
            recommendations.push({
                type: 'success',
                icon: '✅',
                text: `¡Excelente ROI del ${expectedMetrics.roi.toFixed(2)}%! Este proyecto muestra retornos financieros sólidos y es altamente recomendado para su aprobación.`
            });
        } else if (expectedMetrics.roi > 20) {
            recommendations.push({
                type: 'info',
                icon: '👍',
                text: `Buen ROI del ${expectedMetrics.roi.toFixed(2)}%. Este proyecto es financieramente viable y debería considerarse favorablemente.`
            });
        } else if (expectedMetrics.roi > 0) {
            recommendations.push({
                type: 'warning',
                icon: '⚠️',
                text: `ROI moderado del ${expectedMetrics.roi.toFixed(2)}%. Considere formas de aumentar los ingresos o reducir costos para mejorar los retornos.`
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: '❌',
                text: `ROI negativo del ${expectedMetrics.roi.toFixed(2)}%. Este proyecto no es financieramente viable en su forma actual y requiere cambios significativos.`
            });
        }

        // NPV Analysis
        if (expectedMetrics.npv > 0) {
            recommendations.push({
                type: 'success',
                icon: '💰',
                text: `VPN positivo de $${expectedMetrics.npv.toLocaleString('es-ES', { maximumFractionDigits: 0 })} indica que el proyecto creará valor después de considerar el valor temporal del dinero.`
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: '📉',
                text: `VPN negativo de $${expectedMetrics.npv.toLocaleString('es-ES', { maximumFractionDigits: 0 })} sugiere que el proyecto destruirá valor. Revise la tasa de descuento y proyecciones de ingresos.`
            });
        }

        // Payback Period Analysis
        if (expectedMetrics.paybackPeriod <= 12) {
            recommendations.push({
                type: 'success',
                icon: '⚡',
                text: `Período de recuperación rápido de ${expectedMetrics.paybackPeriod.toFixed(1)} meses. Recuperará su inversión en menos de un año.`
            });
        } else if (expectedMetrics.paybackPeriod <= 24) {
            recommendations.push({
                type: 'info',
                icon: '⏱️',
                text: `Período de recuperación razonable de ${expectedMetrics.paybackPeriod.toFixed(1)} meses (${(expectedMetrics.paybackPeriod / 12).toFixed(1)} años).`
            });
        } else if (expectedMetrics.paybackPeriod < data.projectDuration) {
            recommendations.push({
                type: 'warning',
                icon: '⏳',
                text: `Período de recuperación largo de ${expectedMetrics.paybackPeriod.toFixed(1)} meses. Considere si este plazo se alinea con sus objetivos estratégicos.`
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: '🚫',
                text: `El período de recuperación excede la duración del proyecto. El proyecto no alcanzará el punto de equilibrio dentro del plazo planificado.`
            });
        }

        // Risk Analysis
        const roiRange = bestMetrics.roi - worstMetrics.roi;
        if (roiRange > 100) {
            recommendations.push({
                type: 'warning',
                icon: '🎲',
                text: `Alta variabilidad en escenarios (rango de ${roiRange.toFixed(0)}%) indica riesgo significativo. Considere estrategias de mitigación de riesgos.`
            });
        } else if (roiRange < 30) {
            recommendations.push({
                type: 'success',
                icon: '🎯',
                text: `Baja variabilidad en escenarios sugiere resultados consistentes con riesgo manejable.`
            });
        }

        // Worst Case Analysis
        if (worstMetrics.roi < 0) {
            recommendations.push({
                type: 'warning',
                icon: '⚠️',
                text: `El escenario del peor caso muestra ROI negativo (${worstMetrics.roi.toFixed(2)}%). Asegúrese de tener planes de contingencia si los ingresos son menores a lo esperado.`
            });
        }

        // IRR vs Discount Rate
        if (expectedMetrics.irr > data.discountRate + 5) {
            recommendations.push({
                type: 'success',
                icon: '📈',
                text: `La TIR del ${expectedMetrics.irr.toFixed(2)}% excede significativamente su tasa de descuento del ${data.discountRate}%, indicando una fuerte creación de valor.`
            });
        } else if (expectedMetrics.irr > data.discountRate) {
            recommendations.push({
                type: 'info',
                icon: '✓',
                text: `La TIR del ${expectedMetrics.irr.toFixed(2)}% excede su tasa de descuento, lo cual es positivo pero deja un margen limitado de error.`
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: '⚠️',
                text: `La TIR del ${expectedMetrics.irr.toFixed(2)}% está por debajo de su tasa de descuento del ${data.discountRate}%, sugiriendo destrucción de valor.`
            });
        }

        return recommendations;
    },

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations');
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <span class="recommendation-icon">${rec.icon}</span>
                <strong>${rec.text}</strong>
            </div>
        `).join('');
    }
};

// Form Handling
document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    UIUpdater.showLoading();
    
    // Simulate processing time for better UX
    setTimeout(() => {
        // Collect form data
        projectData = {
            projectName: document.getElementById('projectName').value,
            initialInvestment: parseFloat(document.getElementById('initialInvestment').value),
            discountRate: parseFloat(document.getElementById('discountRate').value),
            projectDuration: parseInt(document.getElementById('projectDuration').value),
            yearlyRevenue: parseFloat(document.getElementById('yearlyRevenue').value),
            revenueGrowth: parseFloat(document.getElementById('revenueGrowth').value),
            operatingCosts: parseFloat(document.getElementById('operatingCosts').value),
            maintenanceCosts: parseFloat(document.getElementById('maintenanceCosts').value),
            bestCaseMultiplier: parseFloat(document.getElementById('bestCaseMultiplier').value),
            worstCaseMultiplier: parseFloat(document.getElementById('worstCaseMultiplier').value)
        };

        // Calculate metrics for all scenarios
        const expectedMetrics = FinancialCalculator.calculateMetrics(projectData);
        
        const bestCaseData = { ...projectData, yearlyRevenue: projectData.yearlyRevenue * projectData.bestCaseMultiplier };
        const bestMetrics = FinancialCalculator.calculateMetrics(bestCaseData);
        
        const worstCaseData = { ...projectData, yearlyRevenue: projectData.yearlyRevenue * projectData.worstCaseMultiplier };
        const worstMetrics = FinancialCalculator.calculateMetrics(worstCaseData);

        // Update UI
        UIUpdater.updateDashboard(expectedMetrics);
        UIUpdater.updateScenarioCards(expectedMetrics, bestMetrics, worstMetrics);

        // Create charts
        ChartManager.createCashFlowChart(expectedMetrics.cashFlows, projectData.projectDuration);
        ChartManager.createROIChart(expectedMetrics.roi, bestMetrics.roi, worstMetrics.roi);
        ChartManager.createScenariosChart(expectedMetrics, bestMetrics, worstMetrics);

        // Generate and display recommendations
        const recommendations = RecommendationEngine.generateRecommendations(expectedMetrics, bestMetrics, worstMetrics, projectData);
        RecommendationEngine.displayRecommendations(recommendations);

        UIUpdater.hideLoading();
        UIUpdater.showMessage('success', '✅ ¡Análisis completado exitosamente! Revise las métricas y recomendaciones a continuación.');

        // Smooth scroll to dashboard
        document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 800);
});

// Tab Switching
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Reset Form
function resetForm() {
    if (confirm('¿Está seguro de que desea reiniciar el formulario? Todos los datos se borrarán.')) {
        document.getElementById('projectForm').reset();
        
        // Reset dashboard
        document.getElementById('roi-value').textContent = '0%';
        document.getElementById('npv-value').textContent = '$0';
        document.getElementById('payback-value').textContent = '0';
        document.getElementById('irr-value').textContent = '0%';
        document.getElementById('roi-status').textContent = 'Ingrese datos para calcular';
        document.getElementById('npv-status').textContent = 'Flujo de caja descontado';
        
        // Reset scenario cards
        ['expected', 'best', 'worst'].forEach(scenario => {
            document.getElementById(`${scenario}-roi`).textContent = '0%';
            document.getElementById(`${scenario}-npv`).textContent = '$0';
            document.getElementById(`${scenario}-payback`).textContent = '0 meses';
        });
        
        // Clear charts
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        // Reset recommendations
        document.getElementById('recommendations').innerHTML = '<p style="color: rgba(255, 255, 255, 0.7);">Complete el formulario y calcule para recibir recomendaciones inteligentes basadas en su análisis de caso de negocio.</p>';
        
        UIUpdater.showMessage('info', 'El formulario ha sido reiniciado. Ingrese nuevos datos del proyecto para analizar.');
    }
}

// PDF Export Function
function exportToPDF() {
    if (!projectData) {
        alert('Por favor calcule su caso de negocio primero antes de exportar.');
        return;
    }

    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        alert('Biblioteca de exportación PDF no cargada. Por favor verifique su conexión a internet y actualice la página.');
        return;
    }

    UIUpdater.showLoading();

    setTimeout(() => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPosition = 20;
        const lineHeight = 7;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;

        // Header
        doc.setFontSize(20);
        doc.setTextColor(131, 56, 236);
        doc.text('Analizador de Casos de Negocio Pro', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Reporte de Análisis Financiero', margin, yPosition);
        yPosition += 10;

        // Project Information
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Información del Proyecto', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.text(`Nombre del Proyecto: ${projectData.projectName}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Inversión Inicial: $${projectData.initialInvestment.toLocaleString('es-ES')}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Duración del Proyecto: ${projectData.projectDuration} meses`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Tasa de Descuento: ${projectData.discountRate}%`, margin + 5, yPosition);
        yPosition += lineHeight + 5;

        // Financial Metrics
        doc.setFontSize(14);
        doc.text('Métricas Financieras Clave', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        const roiValue = document.getElementById('roi-value').textContent;
        const npvValue = document.getElementById('npv-value').textContent;
        const paybackValue = document.getElementById('payback-value').textContent;
        const irrValue = document.getElementById('irr-value').textContent;

        doc.text(`ROI (Retorno de Inversión): ${roiValue}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`VPN (Valor Presente Neto): ${npvValue}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Período de Recuperación: ${paybackValue} meses`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`TIR (Tasa Interna de Retorno): ${irrValue}`, margin + 5, yPosition);
        yPosition += lineHeight + 5;

        // Scenario Analysis
        doc.setFontSize(14);
        doc.text('Análisis de Escenarios', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.text('Caso Esperado:', margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`  ROI: ${document.getElementById('expected-roi').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;
        doc.text(`  VPN: ${document.getElementById('expected-npv').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;

        doc.text('Mejor Caso:', margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`  ROI: ${document.getElementById('best-roi').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;
        doc.text(`  VPN: ${document.getElementById('best-npv').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;

        doc.text('Peor Caso:', margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`  ROI: ${document.getElementById('worst-roi').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;
        doc.text(`  VPN: ${document.getElementById('worst-npv').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight + 5;

        // Recommendations
        if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Recomendaciones', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(9);
        const recommendations = document.querySelectorAll('.recommendation-item strong');
        recommendations.forEach((rec, index) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            const text = doc.splitTextToSize(`${index + 1}. ${rec.textContent}`, pageWidth - margin * 2);
            doc.text(text, margin + 5, yPosition);
            yPosition += text.length * lineHeight + 2;
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.height - 10);
        }

        // Save PDF
        const fileName = `Caso_Negocio_${projectData.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        UIUpdater.hideLoading();
        UIUpdater.showMessage('success', '📥 ¡Reporte PDF exportado exitosamente!');
    }, 500);
}

// Auto-calculate on input change (debounced)
let autoCalcTimeout;
const formInputs = document.querySelectorAll('#projectForm input');
formInputs.forEach(input => {
    input.addEventListener('input', function() {
        clearTimeout(autoCalcTimeout);
        autoCalcTimeout = setTimeout(() => {
            // Only auto-calculate if we have already calculated once
            if (projectData && document.getElementById('projectForm').checkValidity()) {
                document.getElementById('projectForm').dispatchEvent(new Event('submit'));
            }
        }, 1500);
    });
});

// Initialize with sample data on page load for demo purposes
window.addEventListener('load', function() {
    // Set default values
    document.getElementById('projectName').value = 'Iniciativa de Transformación Digital';
    document.getElementById('initialInvestment').value = '150000';
    document.getElementById('yearlyRevenue').value = '75000';
    document.getElementById('operatingCosts').value = '15000';
    document.getElementById('maintenanceCosts').value = '5000';
    
    // Show welcome message
    setTimeout(() => {
        UIUpdater.showMessage('info', '👋 ¡Bienvenido! Ingrese los datos de su proyecto o haga clic en "Calcular Análisis" para ver una demostración con datos de ejemplo.');
    }, 500);
});
