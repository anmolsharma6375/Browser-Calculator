
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

  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.remove('flash');
      // force reflow so the flash animation can retrigger on rapid clicks
      void btn.offsetWidth;
      btn.classList.add('flash');

      const action = btn.dataset.action;
      const value = btn.dataset.value;

      if (action === 'clear') handleClear();
      else if (action === 'del') handleDelete();
      else if (action === 'sign') handleSign();
      else if (action === 'equals') handleEquals();
      else if (value === '%') handlePercent();
      else if (isOperator(value)) handleOperator(value);
      else if (value !== undefined) handleDigit(value);
    });
  });

  render();


