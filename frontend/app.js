// Chart seed (simple)
const ctx = document.getElementById('sensorChart')?.getContext('2d');
let sensorChart = null;
if (ctx) {
  sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Soil Moisture (%)',
          data: [20, 30, 40, 35, 50, 60],
          borderColor: 'green',
          tension: 0.3
        },
        {
          label: 'Temperature (°C)',
          data: [22, 24, 28, 31, 30, 33],
          borderColor: 'orange',
          tension: 0.3
        }
      ]
    },
    options: { responsive: true }
  });
}

// -------- Upload CSV -> refresh chart --------
document.getElementById('uploadBtn')?.addEventListener('click', async () => {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];
  const msg = document.getElementById('uploadMsg');
  if (!file) {
    msg.innerHTML = '<div class="alert alert-warning mt-2">Please select a CSV file.</div>';
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) {
      msg.innerHTML = `<div class="alert alert-danger mt-2">${data.error || 'Upload failed'}</div>`;
      return;
    }
    msg.innerHTML = `<div class="alert alert-success mt-2">${data.message}</div>`;
    if (sensorChart && data.labels && data.columns && data.trends) {
      // Use first two numeric columns if available
      const cols = data.columns;
      const first = cols[0], second = cols[1];
      sensorChart.data.labels = data.labels;
      if (first) {
        if (!sensorChart.data.datasets[0]) sensorChart.data.datasets[0] = {label:first, data:[], borderColor:'green', tension:0.3};
        sensorChart.data.datasets[0].label = first;
        sensorChart.data.datasets[0].data = data.trends[first] || [];
      }
      if (second) {
        if (!sensorChart.data.datasets[1]) sensorChart.data.datasets[1] = {label:second, data:[], borderColor:'orange', tension:0.3};
        sensorChart.data.datasets[1].label = second;
        sensorChart.data.datasets[1].data = data.trends[second] || [];
      }
      sensorChart.update();
    }
  } catch (e) {
    msg.innerHTML = `<div class="alert alert-danger mt-2">Network error.</div>`;
    console.error(e);
  }
});

// -------- Yield Prediction --------
document.getElementById('predictBtn')?.addEventListener('click', async () => {
  const msg = document.getElementById('predictMsg');
  msg.innerHTML = '<div class="text-muted">Predicting…</div>';
  const payload = {
    features: {
      soil_moisture: parseFloat(document.getElementById('f1').value || 0),
      temperature: parseFloat(document.getElementById('f2').value || 0),
      humidity: parseFloat(document.getElementById('f3').value || 0),
      rainfall: parseFloat(document.getElementById('f4').value || 0)
    }
  };
  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      msg.innerHTML = `<div class="alert alert-danger">Error: ${data.error || 'Failed'}</div>`;
      return;
    }
    document.getElementById('yieldValue').textContent = `${data.prediction ?? '--'} kg/ha`;
    document.getElementById('confidenceValue').textContent = `Confidence: ${data.confidence ? Math.round(data.confidence*100)+'%' : '--'}`;
    msg.innerHTML = '<div class="alert alert-success">Prediction updated.</div>';
  } catch (e) {
    msg.innerHTML = `<div class="alert alert-danger">Network error.</div>`;
  }
});

// -------- Disease Detection --------
document.getElementById('diseaseBtn')?.addEventListener('click', async () => {
  const img = document.getElementById('diseaseImg').files[0];
  const msg = document.getElementById('diseaseMsg');
  if (!img) {
    msg.innerHTML = '<div class="alert alert-warning">Please choose a leaf image.</div>';
    return;
  }
  const fd = new FormData();
  fd.append('image', img);
  msg.innerHTML = '<div class="text-muted">Detecting…</div>';
  try {
    const res = await fetch('/detect-disease', {method:'POST', body:fd});
    const data = await res.json();
    if (!res.ok) {
      msg.innerHTML = `<div class="alert alert-danger">Error: ${data.error || 'Failed'}</div>`;
      return;
    }
    msg.innerHTML = `
      <div class="alert alert-success">
        <strong>${data.disease}</strong><br>
        Confidence: ${(data.confidence*100).toFixed(1)}%
      </div>
    `;
  } catch (e) {
    msg.innerHTML = `<div class="alert alert-danger">Network error.</div>`;
  }
});

// -------- Pesticide Suggestion (stub) --------
document.getElementById('pesticideBtn')?.addEventListener('click', async () => {
  const msg = document.getElementById('pesticideMsg');
  msg.innerHTML = '<div class="text-muted">Fetching suggestion…</div>';
  try {
    const res = await fetch('/pesticide', {method:'POST'});
    const data = await res.json();
    if (!res.ok) {
      msg.innerHTML = `<div class="alert alert-danger">Error</div>`;
      return;
    }
    msg.innerHTML = `<div class="alert alert-info">${data.suggestion}</div>`;
  } catch (e) {
    msg.innerHTML = `<div class="alert alert-danger">Network error.</div>`;
  }
});

// -------- Crop Recommendation --------
const byId = id => document.getElementById(id);
document.getElementById('cropRecBtn')?.addEventListener('click', async () => {
  const msg = byId('cropRecMsg');
  msg.innerHTML = '<div class="text-muted">Computing recommendation...</div>';
  const payload = {
    features: {
      temperature:     parseFloat(byId('cr_temp').value || 0),
      humidity:        parseFloat(byId('cr_hum').value || 0),
      soil_moisture:   parseFloat(byId('cr_soil').value || 0),
      rainfall:        parseFloat(byId('cr_rain').value || 0),
      fertilizer:      parseFloat(byId('cr_fert').value || 0),
      pesticide_index: parseFloat(byId('cr_pest').value || 0),
      disease_index:   parseFloat(byId('cr_dis').value || 0),
    }
  };
  try {
    const resp = await fetch('/recommend-crop', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (!resp.ok) {
      msg.innerHTML = `<div class="alert alert-danger">Error: ${data.error || 'Failed'}</div>`;
      return;
    }
    const list = (data.recommended || []).map(
      c => `<span class="badge bg-success-subtle border text-success me-2">${c}</span>`
    ).join('');
    const scores = data.scores || {};
    const rows = Object.keys(scores)
      .sort((a,b)=>scores[b]-scores[a])
      .map(c => `<tr><td>${c}</td><td>${(scores[c]*100).toFixed(1)}%</td></tr>`)
      .join('');

    msg.innerHTML = `
      <div class="alert alert-success mb-2">
        <div><strong>Recommended:</strong> ${list || 'No strong match.'}</div>
        <div class="small text-muted">Method: ${data.method}</div>
      </div>
      <div class="table-responsive">
        <table class="table table-sm">
          <thead><tr><th>Crop</th><th>Suitability</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } catch (e) {
    console.error(e);
    msg.innerHTML = `<div class="alert alert-danger">Network error</div>`;
  }
});
