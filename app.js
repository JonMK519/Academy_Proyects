// ====================================
// Business Case Analyzer Pro - Main JS
// Complete Financial Analysis Engine
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
        document.getElementById('npv-value').textContent = '$' + metrics.npv.toLocaleString('en-US', { maximumFractionDigits: 0 });
        document.getElementById('payback-value').textContent = metrics.paybackPeriod.toFixed(1);
        document.getElementById('irr-value').textContent = metrics.irr.toFixed(2) + '%';

        // Update status messages
        document.getElementById('roi-status').textContent = metrics.roi > 0 ? '✓ Positive return' : '✗ Negative return';
        document.getElementById('npv-status').textContent = metrics.npv > 0 ? '✓ Value creating' : '✗ Value destroying';
    },

    updateScenarioCards(expectedMetrics, bestMetrics, worstMetrics) {
        // Expected case
        document.getElementById('expected-roi').textContent = expectedMetrics.roi.toFixed(2) + '%';
        document.getElementById('expected-npv').textContent = '$' + expectedMetrics.npv.toLocaleString('en-US', { maximumFractionDigits: 0 });
        document.getElementById('expected-payback').textContent = expectedMetrics.paybackPeriod.toFixed(1) + ' months';

        // Best case
        document.getElementById('best-roi').textContent = bestMetrics.roi.toFixed(2) + '%';
        document.getElementById('best-npv').textContent = '$' + bestMetrics.npv.toLocaleString('en-US', { maximumFractionDigits: 0 });
        document.getElementById('best-payback').textContent = bestMetrics.paybackPeriod.toFixed(1) + ' months';

        // Worst case
        document.getElementById('worst-roi').textContent = worstMetrics.roi.toFixed(2) + '%';
        document.getElementById('worst-npv').textContent = '$' + worstMetrics.npv.toLocaleString('en-US', { maximumFractionDigits: 0 });
        document.getElementById('worst-payback').textContent = worstMetrics.paybackPeriod.toFixed(1) + ' months';
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
                    label: 'Monthly Cash Flow',
                    data: cashFlows,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Cumulative Cash Flow',
                    data: cumulativeCashFlow,
                    borderColor: 'rgba(0, 212, 170, 1)',
                    backgroundColor: 'rgba(0, 212, 170, 0.1)',
                    borderWidth: 2,
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
                        text: 'Cash Flow Analysis Over Time',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
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
                                label += '$' + context.parsed.y.toLocaleString('en-US', { maximumFractionDigits: 0 });
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
                                return '$' + value.toLocaleString('en-US');
                            }
                        }
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
                labels: ['Expected Case', 'Best Case', 'Worst Case'],
                datasets: [{
                    label: 'ROI (%)',
                    data: [expectedROI, bestROI, worstROI],
                    backgroundColor: [
                        'rgba(79, 172, 254, 0.8)',
                        'rgba(0, 212, 170, 0.8)',
                        'rgba(255, 107, 107, 0.8)'
                    ],
                    borderColor: [
                        'rgba(79, 172, 254, 1)',
                        'rgba(0, 212, 170, 1)',
                        'rgba(255, 107, 107, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'ROI Comparison Across Scenarios',
                        font: { size: 16, weight: 'bold' }
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
                            }
                        }
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
                labels: ['ROI', 'NPV (scaled)', 'Payback Period (inv)', 'IRR'],
                datasets: [{
                    label: 'Expected Case',
                    data: [
                        expectedMetrics.roi,
                        expectedMetrics.npv / 1000,
                        100 / (expectedMetrics.paybackPeriod || 1),
                        expectedMetrics.irr
                    ],
                    borderColor: 'rgba(79, 172, 254, 1)',
                    backgroundColor: 'rgba(79, 172, 254, 0.2)',
                    borderWidth: 2
                }, {
                    label: 'Best Case',
                    data: [
                        bestMetrics.roi,
                        bestMetrics.npv / 1000,
                        100 / (bestMetrics.paybackPeriod || 1),
                        bestMetrics.irr
                    ],
                    borderColor: 'rgba(0, 212, 170, 1)',
                    backgroundColor: 'rgba(0, 212, 170, 0.2)',
                    borderWidth: 2
                }, {
                    label: 'Worst Case',
                    data: [
                        worstMetrics.roi,
                        worstMetrics.npv / 1000,
                        100 / (worstMetrics.paybackPeriod || 1),
                        worstMetrics.irr
                    ],
                    borderColor: 'rgba(255, 107, 107, 1)',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Multi-Dimensional Scenario Analysis',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true
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
                text: `Excellent ROI of ${expectedMetrics.roi.toFixed(2)}%! This project shows strong financial returns and is highly recommended for approval.`
            });
        } else if (expectedMetrics.roi > 20) {
            recommendations.push({
                type: 'info',
                icon: '👍',
                text: `Good ROI of ${expectedMetrics.roi.toFixed(2)}%. This project is financially viable and should be considered favorably.`
            });
        } else if (expectedMetrics.roi > 0) {
            recommendations.push({
                type: 'warning',
                icon: '⚠️',
                text: `Moderate ROI of ${expectedMetrics.roi.toFixed(2)}%. Consider ways to increase revenue or reduce costs to improve returns.`
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: '❌',
                text: `Negative ROI of ${expectedMetrics.roi.toFixed(2)}%. This project is not financially viable in its current form and requires significant changes.`
            });
        }

        // NPV Analysis
        if (expectedMetrics.npv > 0) {
            recommendations.push({
                type: 'success',
                icon: '💰',
                text: `Positive NPV of $${expectedMetrics.npv.toLocaleString('en-US', { maximumFractionDigits: 0 })} indicates the project will create value after accounting for the time value of money.`
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: '📉',
                text: `Negative NPV of $${expectedMetrics.npv.toLocaleString('en-US', { maximumFractionDigits: 0 })} suggests the project will destroy value. Review discount rate and revenue projections.`
            });
        }

        // Payback Period Analysis
        if (expectedMetrics.paybackPeriod <= 12) {
            recommendations.push({
                type: 'success',
                icon: '⚡',
                text: `Quick payback period of ${expectedMetrics.paybackPeriod.toFixed(1)} months. You'll recover your investment within a year.`
            });
        } else if (expectedMetrics.paybackPeriod <= 24) {
            recommendations.push({
                type: 'info',
                icon: '⏱️',
                text: `Reasonable payback period of ${expectedMetrics.paybackPeriod.toFixed(1)} months (${(expectedMetrics.paybackPeriod / 12).toFixed(1)} years).`
            });
        } else if (expectedMetrics.paybackPeriod < data.projectDuration) {
            recommendations.push({
                type: 'warning',
                icon: '⏳',
                text: `Long payback period of ${expectedMetrics.paybackPeriod.toFixed(1)} months. Consider if this timeline aligns with your strategic goals.`
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: '🚫',
                text: `Payback period exceeds project duration. The project will not break even within the planned timeframe.`
            });
        }

        // Risk Analysis
        const roiRange = bestMetrics.roi - worstMetrics.roi;
        if (roiRange > 100) {
            recommendations.push({
                type: 'warning',
                icon: '🎲',
                text: `High variability in scenarios (${roiRange.toFixed(0)}% range) indicates significant risk. Consider risk mitigation strategies.`
            });
        } else if (roiRange < 30) {
            recommendations.push({
                type: 'success',
                icon: '🎯',
                text: `Low variability in scenarios suggests consistent outcomes with manageable risk.`
            });
        }

        // Worst Case Analysis
        if (worstMetrics.roi < 0) {
            recommendations.push({
                type: 'warning',
                icon: '⚠️',
                text: `Worst case scenario shows negative ROI (${worstMetrics.roi.toFixed(2)}%). Ensure you have contingency plans if revenues fall short.`
            });
        }

        // IRR vs Discount Rate
        if (expectedMetrics.irr > data.discountRate + 5) {
            recommendations.push({
                type: 'success',
                icon: '📈',
                text: `IRR of ${expectedMetrics.irr.toFixed(2)}% significantly exceeds your discount rate of ${data.discountRate}%, indicating strong value creation.`
            });
        } else if (expectedMetrics.irr > data.discountRate) {
            recommendations.push({
                type: 'info',
                icon: '✓',
                text: `IRR of ${expectedMetrics.irr.toFixed(2)}% exceeds your discount rate, which is positive but leaves limited margin for error.`
            });
        } else {
            recommendations.push({
                type: 'danger',
                icon: '⚠️',
                text: `IRR of ${expectedMetrics.irr.toFixed(2)}% is below your discount rate of ${data.discountRate}%, suggesting value destruction.`
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
        UIUpdater.showMessage('success', '✅ Analysis completed successfully! Review the metrics and recommendations below.');

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
    if (confirm('Are you sure you want to reset the form? All data will be cleared.')) {
        document.getElementById('projectForm').reset();
        
        // Reset dashboard
        document.getElementById('roi-value').textContent = '0%';
        document.getElementById('npv-value').textContent = '$0';
        document.getElementById('payback-value').textContent = '0';
        document.getElementById('irr-value').textContent = '0%';
        document.getElementById('roi-status').textContent = 'Enter data to calculate';
        document.getElementById('npv-status').textContent = 'Discounted cash flow';
        
        // Reset scenario cards
        ['expected', 'best', 'worst'].forEach(scenario => {
            document.getElementById(`${scenario}-roi`).textContent = '0%';
            document.getElementById(`${scenario}-npv`).textContent = '$0';
            document.getElementById(`${scenario}-payback`).textContent = '0 months';
        });
        
        // Clear charts
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        // Reset recommendations
        document.getElementById('recommendations').innerHTML = '<p style="color: #718096;">Complete the form and calculate to receive intelligent recommendations based on your business case analysis.</p>';
        
        UIUpdater.showMessage('info', 'Form has been reset. Enter new project data to analyze.');
    }
}

// PDF Export Function
function exportToPDF() {
    if (!projectData) {
        alert('Please calculate your business case first before exporting.');
        return;
    }

    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        alert('PDF export library not loaded. Please check your internet connection and refresh the page.');
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
        doc.setTextColor(102, 126, 234);
        doc.text('Business Case Analyzer Pro', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Financial Analysis Report', margin, yPosition);
        yPosition += 10;

        // Project Information
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Project Information', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.text(`Project Name: ${projectData.projectName}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Initial Investment: $${projectData.initialInvestment.toLocaleString('en-US')}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Project Duration: ${projectData.projectDuration} months`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Discount Rate: ${projectData.discountRate}%`, margin + 5, yPosition);
        yPosition += lineHeight + 5;

        // Financial Metrics
        doc.setFontSize(14);
        doc.text('Key Financial Metrics', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        const roiValue = document.getElementById('roi-value').textContent;
        const npvValue = document.getElementById('npv-value').textContent;
        const paybackValue = document.getElementById('payback-value').textContent;
        const irrValue = document.getElementById('irr-value').textContent;

        doc.text(`ROI (Return on Investment): ${roiValue}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`NPV (Net Present Value): ${npvValue}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Payback Period: ${paybackValue} months`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`IRR (Internal Rate of Return): ${irrValue}`, margin + 5, yPosition);
        yPosition += lineHeight + 5;

        // Scenario Analysis
        doc.setFontSize(14);
        doc.text('Scenario Analysis', margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.text('Expected Case:', margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`  ROI: ${document.getElementById('expected-roi').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;
        doc.text(`  NPV: ${document.getElementById('expected-npv').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;

        doc.text('Best Case:', margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`  ROI: ${document.getElementById('best-roi').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;
        doc.text(`  NPV: ${document.getElementById('best-npv').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;

        doc.text('Worst Case:', margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`  ROI: ${document.getElementById('worst-roi').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight;
        doc.text(`  NPV: ${document.getElementById('worst-npv').textContent}`, margin + 10, yPosition);
        yPosition += lineHeight + 5;

        // Recommendations
        if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Recommendations', margin, yPosition);
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
        const fileName = `Business_Case_${projectData.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        UIUpdater.hideLoading();
        UIUpdater.showMessage('success', '📥 PDF report exported successfully!');
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
    document.getElementById('projectName').value = 'Digital Transformation Initiative';
    document.getElementById('initialInvestment').value = '150000';
    document.getElementById('yearlyRevenue').value = '75000';
    document.getElementById('operatingCosts').value = '15000';
    document.getElementById('maintenanceCosts').value = '5000';
    
    // Show welcome message
    setTimeout(() => {
        UIUpdater.showMessage('info', '👋 Welcome! Enter your project data or click "Calculate Analysis" to see a demo with sample data.');
    }, 500);
});
