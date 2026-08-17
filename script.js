const form = document.getElementById('agencyForm');
const formCard = document.getElementById('formCard');
const resultPage = document.getElementById('resultPage');
const nextStepBtn = document.getElementById('nextStepBtn');
const backStepBtn = document.getElementById('backStepBtn');
const steps = Array.from(document.querySelectorAll('.form-step'));
const indicators = Array.from(document.querySelectorAll('.step'));
const successMessage = document.getElementById('successMessage');
const loadingState = document.getElementById('loadingState');
const lowValueEl = document.getElementById('lowValue');
const highValueEl = document.getElementById('highValue');
const marginMessageEl = document.getElementById('marginMessage');

let currentStep = 0;

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function parseCurrency(value) {
  if (!value) return 0;

  const numericValue = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatCurrencyInput(value) {
  const numericValue = parseCurrency(value);

  if (!numericValue && numericValue !== 0) {
    return '';
  }

  return formatCurrency(numericValue);
}

function attachCurrencyFormatting(fieldName) {
  const field = document.querySelector(`input[name="${fieldName}"]`);

  if (!field) return;

  field.addEventListener('input', (event) => {
    const originalValue = event.target.value;
    const numericValue = parseCurrency(originalValue);

    if (!originalValue.trim()) {
      event.target.value = '';
      return;
    }

    if (Number.isFinite(numericValue)) {
      event.target.value = formatCurrencyInput(originalValue);
    }
  });
}

function showStep(stepIndex) {
  currentStep = stepIndex;

  steps.forEach((step, index) => {
    step.classList.toggle('active', index === stepIndex);
  });

  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === stepIndex);
  });
}

function validateStep(stepIndex) {
  const stepFields = steps[stepIndex].querySelectorAll('input[required]');

  for (const field of stepFields) {
    if (!field.value.trim()) {
      field.focus();
      field.reportValidity();
      return false;
    }
  }

  return true;
}

nextStepBtn.addEventListener('click', () => {
  if (!validateStep(0)) return;
  showStep(1);
});

backStepBtn.addEventListener('click', () => {
  showStep(0);
});

attachCurrencyFormatting('revenue');
attachCurrencyFormatting('netIncome');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!validateStep(1)) return;

  const data = new FormData(form);
  const revenue = parseCurrency(data.get('revenue'));
  const netIncome = parseCurrency(data.get('netIncome'));
  const ebitdaMargin = revenue > 0 ? netIncome / revenue : 0;
  const lowValue = netIncome * 6;
  const highValue = netIncome * 8;

  lowValueEl.textContent = formatCurrency(lowValue);
  highValueEl.textContent = formatCurrency(highValue);

  if (ebitdaMargin < 0.25) {
    marginMessageEl.textContent = 'One way to improve your valuation would be to focus on bringing your EBITDA up.';
  } else {
    marginMessageEl.textContent = '';
  }

  formCard.classList.add('hidden');
  resultPage.classList.remove('hidden');
  successMessage.classList.add('hidden');
  loadingState.classList.remove('hidden');

  window.setTimeout(() => {
    loadingState.classList.add('hidden');
    successMessage.classList.remove('hidden');
  }, 6000);
});
