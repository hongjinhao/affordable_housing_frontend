const apiBaseUrl = 'http://localhost:8000';
const resultDiv = document.getElementById('result');
const healthStatusDiv = document.getElementById('health-status');
const form = document.getElementById('prediction-form');

// Check API health on page load
async function checkHealth() {
    try {
        const response = await fetch(`/health`);
        console.log("debug")
        if (response.ok) {
            healthStatusDiv.textContent = 'API Status: Healthy';
            healthStatusDiv.classList.add('online');
            healthStatusDiv.style.display = 'block';
        } else {
            throw new Error('API is down');
        }
    } catch (error) {
        healthStatusDiv.textContent = `API Status: Error - ${error.message}`;
        healthStatusDiv.classList.add('offline');
        healthStatusDiv.style.display = 'block';
    }
}

// Handle form submission
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    resultDiv.style.display = 'none';
    resultDiv.classList.remove('success', 'error');

    const formData = new FormData(form);
    const data = {
        avg_targeted_affordability: parseFloat(formData.get('avg_targeted_affordability')),
        CDLAC_total_points_score: parseInt(formData.get('CDLAC_total_points_score')),
        CDLAC_tie_breaker_self_score: parseFloat(formData.get('CDLAC_tie_breaker_self_score')),
        bond_request_amount: parseFloat(formData.get('bond_request_amount')) * 1000000,
        homeless_percent: parseFloat(formData.get('homeless_percent')),
        construction_type: formData.get('construction_type'),
        housing_type: formData.get('housing_type'),
        CDLAC_pool_type: formData.get('CDLAC_pool_type'),
        new_construction_set_aside: formData.get('new_construction_set_aside'),
        CDLAC_region: formData.get('CDLAC_region')
    };

    try {
        const response = await fetch(`${apiBaseUrl}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const predictionText = result.prediction === 1 ? 'Yes' : 'No';
        resultDiv.innerHTML = `
            <strong>Prediction:</strong> Funding ${predictionText}<br>
            <strong>Probability:</strong> ${(result.probability * 100).toFixed(2)}%
        `;
        resultDiv.classList.add('success');
        resultDiv.style.display = 'block';
    } catch (error) {
        resultDiv.textContent = `Error: ${error.message}`;
        resultDiv.classList.add('error');
        resultDiv.style.display = 'block';
    }
});

// Run health check on page load
checkHealth();