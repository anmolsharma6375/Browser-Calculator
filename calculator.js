const inputBox = document.getElementById('inputBox');
const historyBox = document.getElementById('historyBox');
let expression = '0';
let justEvaluated = false;

function render() {
  inputBox.textContent = expression;
}

function isOperator(ch) { return ['+', '-', '*', '/'].includes(ch); }

function handleDigit(d) {
  if (justEvaluated) { expression = d === '.' ? '0.' : d; justEvaluated = false; render(); return; }
  if (expression === '0' && d !== '.') { expression = d; render(); return; }
  if (d === '.' ) {
    const lastNum = expression.split(/[\+\-\*\/]/).pop();
    if (lastNum.includes('.')) return;
  }
  expression += d;
  render();
}

function handleOperator(op) {
  justEvaluated = false;
  const last = expression.slice(-1);
  if (isOperator(last)) {
    expression = expression.slice(0, -1) + op;
  } else {
    expression += op;
  }
  render();
}

function handlePercent() {
  const parts = expression.split(/([\+\-\*\/])/);
  const lastVal = parseFloat(parts[parts.length - 1]);
  if (!isNaN(lastVal)) {
    parts[parts.length - 1] = String(lastVal / 100);
    expression = parts.join('');
    render();
  }
}

function handleSign() {
  const parts = expression.split(/([\+\-\*\/])/);
  const lastIdx = parts.length - 1;
  const val = parseFloat(parts[lastIdx]);
  if (!isNaN(val)) {
    parts[lastIdx] = String(val * -1);
    expression = parts.join('');
    render();
  }
}

function handleClear() {
  expression = '0';
  historyBox.textContent = '';
  justEvaluated = false;
  render();
}

function handleDelete() {
  if (justEvaluated) { handleClear(); return; }
  expression = expression.length > 1 ? expression.slice(0, -1) : '0';
  render();
}

function handleEquals() {
  try {
    // स्मार्ट फिक्स: अगर यूजर ने आख़िरी में ऑपरेटर छोड़कर '=' दबा दिया है (जैसे 12 + 12 + =)
    // तो यह लूप उस एक्स्ट्रा ऑपरेटर को अपने आप हटा देगा ताकि एरर न आए
    while (expression.length > 0 && isOperator(expression.slice(-1))) {
      expression = expression.slice(0, -1);
    }

    if (expression === '') {
      expression = '0';
      render();
      return;
    }

    // eslint-disable-next-line no-eval
    const result = Function('"use strict"; return (' + expression + ')')();
    if (result === undefined || isNaN(result) || !isFinite(result)) throw new Error('bad');
    
    historyBox.textContent = expression + ' =';
    expression = String(Math.round(result * 1e10) / 1e10);
    justEvaluated = true;
    render();
  } catch (e) {
    inputBox.textContent = 'Error';
    expression = '0';
  }
}

// बटन क्लिक ट्रिगर करने वाला फंक्शन
function triggerAction(action, value) {
  if (action === 'clear') handleClear();
  else if (action === 'del') handleDelete();
  else if (action === 'sign') handleSign();
  else if (action === 'equals') handleEquals();
  else if (value === '%') handlePercent();
  else if (isOperator(value)) handleOperator(value);
  else if (value !== undefined) handleDigit(value);
}

// 1. माउस क्लिक इवेंट लिसनर
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.remove('flash');
    void btn.offsetWidth; 
    btn.classList.add('flash');

    triggerAction(btn.dataset.action, btn.dataset.value);
  });
});


// 2. कीबोर्ड सपोर्ट लिसनर
document.addEventListener('keydown', (e) => {
  let key = e.key;
  let targetButton = null;

  if (key >= '0' && key <= '9') {
    triggerAction(undefined, key);
    targetButton = document.querySelector(`button[data-value="${key}"]`);
  } 
  else if (key === '+' || key === '-' || key === '*' || key === '/') {
    triggerAction(undefined, key);
    targetButton = document.querySelector(`button[data-value="${key}"]`);
  } 
  else if (key === '.' || key === ',') {
    triggerAction(undefined, '.');
    targetButton = document.querySelector(`button[data-value="."]`);
  } 
  else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    triggerAction('equals');
    targetButton = document.querySelector(`button[data-action="equals"]`);
  } 
  else if (key === 'Backspace') {
    triggerAction('del');
    targetButton = document.querySelector(`button[data-action="del"]`);
  } 
  else if (key === 'Escape') {
    triggerAction('clear');
    targetButton = document.querySelector(`button[data-action="clear"]`);
  }

  if (targetButton) {
    targetButton.classList.remove('flash');
    void targetButton.offsetWidth;
    targetButton.classList.add('flash');
  }
});

render();
