document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('predict-form');
  const submitBtn = document.getElementById('submit-btn');
  const resetBtn = document.getElementById('reset-btn');
  const retryBtn = document.getElementById('error-retry-btn');

  // UI States
  const stateIdle = document.getElementById('state-idle');
  const stateLoading = document.getElementById('state-loading');
  const stateResult = document.getElementById('state-result');
  const stateError = document.getElementById('state-error');

  // Outputs
  const scoreNumber = document.getElementById('score-number');
  const scoreBand = document.getElementById('score-band');
  const scoreContext = document.getElementById('score-context');
  const errorCopy = document.getElementById('error-copy');
  const gaugeFill = document.getElementById('gauge-fill');

  // Segmented control buttons
  const segBtns = document.querySelectorAll('.segmented .seg-btn');
  const stressInput = document.getElementById('stress_level');

  segBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      segBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      stressInput.value = btn.getAttribute('data-value');
      clearError('stress_level');
    });
  });

  function showState(state) {
    stateIdle.hidden = true;
    stateLoading.hidden = true;
    stateResult.hidden = true;
    stateError.hidden = true;

    if (state === 'idle') stateIdle.hidden = false;
    if (state === 'loading') stateLoading.hidden = false;
    if (state === 'result') stateResult.hidden = false;
    if (state === 'error') stateError.hidden = false;
  }

  function clearError(fieldId) {
    const errorSpan = document.querySelector(`.error-msg[data-for="${fieldId}"]`);
    if (errorSpan) errorSpan.textContent = '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validation
    let isValid = true;
    const formData = new FormData(form);
    const payload = {};

    formData.forEach((value, key) => {
      payload[key] = value;
    });

    if (!payload.stress_level) {
      const errorSpan = document.querySelector('.error-msg[data-for="stress_level"]');
      if (errorSpan) errorSpan.textContent = 'Please select a stress level';
      isValid = false;
    }

    if (!isValid) return;

    // Convert numeric fields
    payload.age = parseInt(payload.age, 10);
    payload.avg_daily_usage_hours = parseFloat(payload.avg_daily_usage_hours);
    payload.daily_unlocks = parseInt(payload.daily_unlocks, 10);
    payload.study_hours = parseFloat(payload.study_hours);
    payload.physical_activity_hours = parseFloat(payload.physical_activity_hours);
    payload.sleep_hours_per_night = parseFloat(payload.sleep_hours_per_night);

    showState('loading');
    submitBtn.disabled = true;

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Server returned error ' + response.status);
      }

      const data = await response.json();
      const score = data.score ?? data.prediction ?? data.predicted_score ?? 0;
      
      scoreNumber.textContent = Number(score).toFixed(1);

      // Score Category Context
      if (score < 3.5) {
        scoreBand.textContent = 'Low Risk';
        scoreContext.textContent = 'Your daily habits and wellness signals look balanced.';
      } else if (score < 7.0) {
        scoreBand.textContent = 'Moderate Stress Signal';
        scoreContext.textContent = 'Consider reducing daily screen time and prioritizing sleep.';
      } else {
        scoreBand.textContent = 'High Stress Signal';
        scoreContext.textContent = 'High screen time and elevated stress detected. Take time to unwind.';
      }

      showState('result');
    } catch (err) {
      errorCopy.textContent = err.message || 'Something went wrong. Please check backend server.';
      showState('error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  resetBtn?.addEventListener('click', () => showState('idle'));
  retryBtn?.addEventListener('click', () => showState('idle'));

  // Initial State
  showState('idle');
});