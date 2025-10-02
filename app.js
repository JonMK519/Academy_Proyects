// ====================================
// Business Case Analyzer Pro - Main JS
// Complete Financial Analysis Engine
// ====================================

// Global state
let currentLanguage = 'en';
let projectData = null;
let charts = {
    cashflow: null,
    roi: null,
    scenarios: null
};

// Translation System
const translations = {
    en: {
        // Header
        'header-title': 'Business Case Analyzer Pro',
        'header-subtitle': 'Professional Financial Analysis & ROI Calculator',
        
        // Section Titles
        'section-dashboard': 'Financial Dashboard',
        'section-project-info': 'Project Information',
        'section-visual-analysis': 'Visual Analysis',
        'section-scenarios': 'Scenario Comparison',
        'section-recommendations': 'Smart Recommendations',
        'section-export': 'Export Report',
        
        // Subsections
        'subsection-revenue': 'Revenue Projections',
        'subsection-costs': 'Cost Projections',
        'subsection-scenarios': 'Scenario Analysis',
        
        // Form Labels
        'label-projectName': 'Project Name',
        'label-initialInvestment': 'Initial Investment ($)',
        'label-discountRate': 'Discount Rate (%)',
        'label-projectDuration': 'Project Duration (months)',
        'label-yearlyRevenue': 'Annual Revenue Increase ($)',
        'label-revenueGrowth': 'Revenue Growth Rate (% yearly)',
        'label-operatingCosts': 'Annual Operating Costs ($)',
        'label-maintenanceCosts': 'Annual Maintenance Costs ($)',
        'label-bestCaseMultiplier': 'Best Case Multiplier',
        'label-worstCaseMultiplier': 'Worst Case Multiplier',
        
        // Buttons
        'btn-calculate': 'Calculate Analysis',
        'btn-reset': 'Reset Form',
        'btn-export': 'Export Full Report to PDF',
        
        // Tabs
        'tab-cashflow': 'Cash Flow Over Time',
        'tab-roi': 'ROI Comparison',
        'tab-scenarios': 'Scenario Analysis',
        
        // Metrics
        'metric-roi': 'ROI (Return on Investment)',
        'metric-npv': 'NPV (Net Present Value)',
        'metric-payback': 'Payback Period',
        'metric-irr': 'IRR (Internal Rate of Return)',
        
        // Scenario Cards
        'scenario-expected': 'Expected Case',
        'scenario-best': 'Best Case',
        'scenario-worst': 'Worst Case',
        'scenario-roi-label': 'ROI:',
        'scenario-npv-label': 'NPV:',
        'scenario-payback-label': 'Payback:',
        
        // Messages
        'export-description': 'Generate a comprehensive PDF report with all metrics, charts and recommendations.',
        'default-recommendations': 'Complete the form and calculate to receive intelligent recommendations based on your business case analysis.',
        'loading': 'Analyzing...',
        'success-message': '✓ Analysis completed successfully! Review the metrics and recommendations below.',
        
        // Chart Labels
        'chart-monthly-cashflow': 'Monthly Cash Flow',
        'chart-cumulative-cashflow': 'Cumulative Cash Flow',
        'chart-expected-roi': 'Expected ROI',
        'chart-best-roi': 'Best Case ROI',
        'chart-worst-roi': 'Worst Case ROI',
        
        // Metric Status
        'status-positive-return': '✓ Positive return',
        'status-negative-return': '✗ Negative return',
        'status-creates-value': '✓ Creates value',
        'status-destroys-value': '✗ Destroys value',
        'status-discounted-cashflow': 'Discounted cash flow',
        'status-months-to-recover': 'months to recover investment',
        'status-annualized-return': 'Annualized return rate',
        'status-enter-data': 'Enter data to calculate',
        
        // Units
        'unit-months': 'months',
        'unit-years': 'years'
    },
    es: {
        // Header
        'header-title': 'Analizador de Casos de Negocio Pro',
        'header-subtitle': 'Análisis Financiero Profesional y Calculadora de ROI',
        
        // Section Titles
        'section-dashboard': 'Panel Financiero',
        'section-project-info': 'Información del Proyecto',
        'section-visual-analysis': 'Análisis Visual',
        'section-scenarios': 'Comparación de Escenarios',
        'section-recommendations': 'Recomendaciones Inteligentes',
        'section-export': 'Exportar Reporte',
        
        // Subsections
        'subsection-revenue': 'Proyecciones de Ingresos',
        'subsection-costs': 'Proyecciones de Costos',
        'subsection-scenarios': 'Análisis de Escenarios',
        
        // Form Labels
        'label-projectName': 'Nombre del Proyecto',
        'label-initialInvestment': 'Inversión Inicial ($)',
        'label-discountRate': 'Tasa de Descuento (%)',
        'label-projectDuration': 'Duración del Proyecto (meses)',
        'label-yearlyRevenue': 'Incremento de Ingresos Anuales ($)',
        'label-revenueGrowth': 'Tasa de Crecimiento de Ingresos (% anual)',
        'label-operatingCosts': 'Costos Operativos Anuales ($)',
        'label-maintenanceCosts': 'Costos de Mantenimiento Anuales ($)',
        'label-bestCaseMultiplier': 'Multiplicador Mejor Caso',
        'label-worstCaseMultiplier': 'Multiplicador Peor Caso',
        
        // Buttons
        'btn-calculate': 'Calcular Análisis',
        'btn-reset': 'Reiniciar Formulario',
        'btn-export': 'Exportar Reporte Completo a PDF',
        
        // Tabs
        'tab-cashflow': 'Flujo de Caja en el Tiempo',
        'tab-roi': 'Comparación de ROI',
        'tab-scenarios': 'Análisis de Escenarios',
        
        // Metrics
        'metric-roi': 'ROI (Retorno de Inversión)',
        'metric-npv': 'VPN (Valor Presente Neto)',
        'metric-payback': 'Período de Recuperación',
        'metric-irr': 'TIR (Tasa Interna de Retorno)',
        
        // Scenario Cards
        'scenario-expected': 'Caso Esperado',
        'scenario-best': 'Mejor Caso',
        'scenario-worst': 'Peor Caso',
        'scenario-roi-label': 'ROI:',
        'scenario-npv-label': 'VPN:',
        'scenario-payback-label': 'Recuperación:',
        
        // Messages
        'export-description': 'Genere un reporte PDF completo con todas las métricas, gráficos y recomendaciones.',
        'default-recommendations': 'Complete el formulario y calcule para recibir recomendaciones inteligentes basadas en su análisis de caso de negocio.',
        'loading': 'Analizando...',
        'success-message': '✓ ¡Análisis completado exitosamente! Revise las métricas y recomendaciones a continuación.',
        
        // Chart Labels
        'chart-monthly-cashflow': 'Flujo de Caja Mensual',
        'chart-cumulative-cashflow': 'Flujo de Caja Acumulado',
        'chart-expected-roi': 'ROI Esperado',
        'chart-best-roi': 'ROI Mejor Caso',
        'chart-worst-roi': 'ROI Peor Caso',
        
        // Metric Status
        'status-positive-return': '✓ Retorno positivo',
        'status-negative-return': '✗ Retorno negativo',
        'status-creates-value': '✓ Genera valor',
        'status-destroys-value': '✗ Destruye valor',
        'status-discounted-cashflow': 'Flujo de caja descontado',
        'status-months-to-recover': 'meses para recuperar inversión',
        'status-annualized-return': 'Tasa de retorno anualizada',
        'status-enter-data': 'Ingrese datos para calcular',
        
        // Units
        'unit-months': 'meses',
        'unit-years': 'años'
    }
};

// Language Switching Function
function switchLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    
    // Update language toggle buttons
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    
    // Update all translatable elements
    const t = translations[lang];
    
    // Update by ID
    Object.keys(t).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                // Don't change input values, only placeholders if needed
            } else if (element.tagName === 'BUTTON') {
                element.textContent = t[key];
            } else {
                element.textContent = t[key];
            }
        }
    });
    
    // Update form labels
    const labels = document.querySelectorAll('label[for]');
    labels.forEach(label => {
        const forAttr = label.getAttribute('for');
        const key = `label-${forAttr}`;
        if (t[key]) {
            // Preserve the asterisk for required fields
            const hasAsterisk = label.textContent.includes('*');
            label.textContent = t[key] + (hasAsterisk ? ' *' : '');
        }
    });
    
    // Update tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        const tabKeys = ['tab-cashflow', 'tab-roi', 'tab-scenarios'];
        if (tabKeys[index] && t[tabKeys[index]]) {
            tab.textContent = t[tabKeys[index]];
        }
    });
    
    // Update scenario card titles and labels
    document.getElementById('title-expected').textContent = '📊 ' + t['scenario-expected'];
    document.getElementById('title-best').textContent = '🚀 ' + t['scenario-best'];
    document.getElementById('title-worst').textContent = '⚠️ ' + t['scenario-worst'];
    
    // Update scenario metric labels
    document.getElementById('label-expected-roi').textContent = t['scenario-roi-label'];
    document.getElementById('label-expected-npv').textContent = t['scenario-npv-label'];
    document.getElementById('label-expected-payback').textContent = t['scenario-payback-label'];
    document.getElementById('label-best-roi').textContent = t['scenario-roi-label'];
    document.getElementById('label-best-npv').textContent = t['scenario-npv-label'];
    document.getElementById('label-best-payback').textContent = t['scenario-payback-label'];
    document.getElementById('label-worst-roi').textContent = t['scenario-roi-label'];
    document.getElementById('label-worst-npv').textContent = t['scenario-npv-label'];
    document.getElementById('label-worst-payback').textContent = t['scenario-payback-label'];
    
    // Update metric card labels
    document.getElementById('metric-label-roi').textContent = t['metric-roi'];
    document.getElementById('metric-label-npv').textContent = t['metric-npv'];
    document.getElementById('metric-label-payback').textContent = t['metric-payback'];
    document.getElementById('metric-label-irr').textContent = t['metric-irr'];
    
    // Update metric status if they haven't been calculated yet
    const roiStatus = document.getElementById('roi-status');
    if (roiStatus.textContent.includes('Enter data') || roiStatus.textContent.includes('Ingrese datos')) {
        roiStatus.textContent = t['status-enter-data'];
        document.getElementById('npv-status').textContent = t['status-discounted-cashflow'];
        document.getElementById('payback-status').textContent = t['status-months-to-recover'];
        document.getElementById('irr-status').textContent = t['status-annualized-return'];
    }
    
    // Update default recommendations text
    const recommendations = document.getElementById('recommendations');
    if (recommendations && recommendations.children.length === 1 && 
        recommendations.children[0].tagName === 'P') {
        recommendations.children[0].textContent = t['default-recommendations'];
        recommendations.children[0].style.color = 'var(--text-muted)';
    }
    
    // Re-render charts if they exist with new labels
    if (charts.cashflow || charts.roi || charts.scenarios) {
        // Charts will be updated when recalculating
    }
}

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
        const t = translations[currentLanguage];
        const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
        
        document.getElementById('roi-value').textContent = metrics.roi.toFixed(2) + '%';
        document.getElementById('npv-value').textContent = '$' + metrics.npv.toLocaleString(locale, { maximumFractionDigits: 0 });
        document.getElementById('payback-value').textContent = metrics.paybackPeriod.toFixed(1);
        document.getElementById('irr-value').textContent = metrics.irr.toFixed(2) + '%';

        // Update status messages with proper translations
        const roiStatus = document.getElementById('roi-status');
        const npvStatus = document.getElementById('npv-status');
        
        roiStatus.textContent = metrics.roi > 0 ? t['status-positive-return'] : t['status-negative-return'];
        npvStatus.textContent = metrics.npv > 0 ? t['status-creates-value'] : t['status-destroys-value'];
    },

    updateScenarioCards(expectedMetrics, bestMetrics, worstMetrics) {
        const t = translations[currentLanguage];
        const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
        const unitMonths = ' ' + t['unit-months'];
        
        // Expected case
        document.getElementById('expected-roi').textContent = expectedMetrics.roi.toFixed(2) + '%';
        document.getElementById('expected-npv').textContent = '$' + expectedMetrics.npv.toLocaleString(locale, { maximumFractionDigits: 0 });
        document.getElementById('expected-payback').textContent = expectedMetrics.paybackPeriod.toFixed(1) + unitMonths;

        // Best case
        document.getElementById('best-roi').textContent = bestMetrics.roi.toFixed(2) + '%';
        document.getElementById('best-npv').textContent = '$' + bestMetrics.npv.toLocaleString(locale, { maximumFractionDigits: 0 });
        document.getElementById('best-payback').textContent = bestMetrics.paybackPeriod.toFixed(1) + unitMonths;

        // Worst case
        document.getElementById('worst-roi').textContent = worstMetrics.roi.toFixed(2) + '%';
        document.getElementById('worst-npv').textContent = '$' + worstMetrics.npv.toLocaleString(locale, { maximumFractionDigits: 0 });
        document.getElementById('worst-payback').textContent = worstMetrics.paybackPeriod.toFixed(1) + unitMonths;
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

        const t = translations[currentLanguage];
        
        charts.cashflow = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: t['chart-monthly-cashflow'],
                    data: cashFlows,
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: t['chart-cumulative-cashflow'],
                    data: cumulativeCashFlow,
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#4B5563', font: { size: 12, weight: '500' } }
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
                                const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
                                label += '$' + context.parsed.y.toLocaleString(locale, { maximumFractionDigits: 0 });
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
                                const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
                                return '$' + value.toLocaleString(locale);
                            },
                            color: '#6B7280'
                        },
                        grid: { color: '#E5E7EB' }
                    },
                    x: {
                        ticks: { color: '#6B7280' },
                        grid: { color: '#E5E7EB' }
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
        
        const t = translations[currentLanguage];
        const ctx = document.getElementById('roiChart').getContext('2d');
        
        if (charts.roi) {
            charts.roi.destroy();
        }

        charts.roi = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [t['scenario-expected'], t['scenario-best'], t['scenario-worst']],
                datasets: [{
                    label: 'ROI (%)',
                    data: [expectedROI, bestROI, worstROI],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(5, 150, 105, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderColor: [
                        '#2563EB',
                        '#059669',
                        '#F59E0B'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
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
                            color: '#6B7280'
                        },
                        grid: { color: '#E5E7EB' }
                    },
                    x: {
                        ticks: { color: '#6B7280' },
                        grid: { color: '#E5E7EB' }
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
        
        const t = translations[currentLanguage];
        const ctx = document.getElementById('scenariosChart').getContext('2d');
        
        if (charts.scenarios) {
            charts.scenarios.destroy();
        }

        charts.scenarios = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['ROI', 'NPV (scaled)', 'Payback (inv)', 'IRR'],
                datasets: [{
                    label: t['scenario-expected'],
                    data: [
                        expectedMetrics.roi,
                        expectedMetrics.npv / 1000,
                        100 / (expectedMetrics.paybackPeriod || 1),
                        expectedMetrics.irr
                    ],
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderWidth: 2
                }, {
                    label: t['scenario-best'],
                    data: [
                        bestMetrics.roi,
                        bestMetrics.npv / 1000,
                        100 / (bestMetrics.paybackPeriod || 1),
                        bestMetrics.irr
                    ],
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.2)',
                    borderWidth: 2
                }, {
                    label: t['scenario-worst'],
                    data: [
                        worstMetrics.roi,
                        worstMetrics.npv / 1000,
                        100 / (worstMetrics.paybackPeriod || 1),
                        worstMetrics.irr
                    ],
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#4B5563', font: { size: 12, weight: '500' } }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: { color: '#6B7280', backdropColor: 'transparent' },
                        grid: { color: '#E5E7EB' },
                        pointLabels: { color: '#4B5563', font: { size: 12, weight: '500' } }
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
