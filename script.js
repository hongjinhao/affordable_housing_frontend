const apiBaseUrl = 'http://localhost:8000';
const resultDiv = document.getElementById('result');
const healthStatusDiv = document.getElementById('health-status');
const form = document.getElementById('prediction-form');

// Check API health on page load
async function checkHealth() {
    try {
        const response = await fetch(`https://vt98nftsz8.execute-api.us-west-1.amazonaws.com/test/health`);
        console.log("debug")
        if (response.ok) {
            const result = await response.json();
            healthStatusDiv.textContent = `API Status: ${result.status || 'Healthy'}`;
            healthStatusDiv.classList.add('online');
            healthStatusDiv.style.display = 'block';
        } else {
            // can fetch but response is bad
            throw new Error('API is down');
        }
    } catch (error) {
        // cannot fetch from API at all OR response is bad
        healthStatusDiv.textContent = `API Status: Error - ${error.message}`;
        healthStatusDiv.classList.add('offline');
        healthStatusDiv.style.display = 'block';
    }
}
async function warmUpPredict() {
    try {
        const dummyData = {
            avg_targeted_affordability: 0.5,
            CDLAC_total_points_score: 120,
            CDLAC_tie_breaker_self_score: 1.0,
            bond_request_amount: 34000000.0,
            homeless_percent: 0.0,
            construction_type: "New Construction",
            housing_type: "Large Family",
            CDLAC_pool_type: "New Construction",
            new_construction_set_aside: "none",
            CDLAC_region: "City of Los Angeles"
        };

        const response = await fetch('https://vt98nftsz8.execute-api.us-west-1.amazonaws.com/test/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dummyData)
        });
        console.log("Warm-up predict response:", response);
        if (response.ok) {
            console.log("Warm-up successful");
        } else {
            const errorBody = await response.json(); // Get error details
            console.log("Warm-up failed:", response.status, errorBody);
        }
    } catch (error) {
        console.log("Warm-up error:", error.message);
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
        const response = await fetch(`https://vt98nftsz8.execute-api.us-west-1.amazonaws.com/test/predict`, {
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
warmUpPredict();