(function () {
  'use strict';

  const searchInput = document.getElementById('tickerInput');
  const symbolList = document.getElementById('symbolResults');
  const runButton = document.getElementById('runSimulation');
  const resultArea = document.getElementById('simulationResults');
  const symbolField = document.getElementById('selectedSymbol');
  const form = document.getElementById('simulationForm');

  const clearElement = (element) => {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  const renderMessage = (message, className) => {
    clearElement(resultArea);
    const paragraph = document.createElement('p');
    if (className) {
      paragraph.className = className;
    }
    paragraph.textContent = message;
    resultArea.appendChild(paragraph);
  };

  const appendStat = (list, label, value) => {
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    description.textContent = value;
    list.append(term, description);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderSymbols = (symbols) => {
    clearElement(symbolList);
    if (!symbols.length) {
      const item = document.createElement('li');
      item.textContent = 'No symbols found.';
      symbolList.appendChild(item);
      return;
    }

    symbols.forEach((symbol) => {
      const item = document.createElement('li');
      item.className = 'symbol-item';
      item.textContent = `${symbol.symbol} — ${symbol.name}`;
      item.addEventListener('click', () => {
        symbolField.value = symbol.symbol;
        searchInput.value = `${symbol.symbol} — ${symbol.name}`;
        clearElement(symbolList);
      });
      symbolList.appendChild(item);
    });
  };

  const fetchSymbols = async (query) => {
    if (!query || query.trim().length < 2) {
      clearElement(symbolList);
      return;
    }

    const response = await fetch(`/api/symbols?q=${encodeURIComponent(query)}`);
    const payload = await response.json();
    renderSymbols(payload.symbols || []);
  };

  const renderSummary = (data) => {
    if (!data) {
      renderMessage('Unable to load simulation results.', 'error');
      return;
    }

    clearElement(resultArea);

    const section = document.createElement('section');
    section.className = 'summary';

    const stats = document.createElement('dl');
    appendStat(stats, 'Symbol', data.symbol);
    appendStat(stats, 'Period', `${data.from} to ${data.to}`);
    appendStat(stats, 'Starting Capital', formatCurrency(data.result.initialCapital));
    appendStat(stats, 'Final Equity', formatCurrency(data.result.finalEquity));
    appendStat(stats, 'Completed Trades', data.result.totalTrades.toLocaleString());
    appendStat(stats, 'Initial Entries', data.result.entries.toLocaleString());
    appendStat(stats, 'Added Units', data.result.addedUnits.toLocaleString());
    appendStat(stats, 'Win Rate', `${data.result.winRate.toFixed(1)}%`);
    appendStat(stats, 'Max Drawdown', `${data.result.maxDrawdown.toFixed(1)}%`);

    section.appendChild(stats);
    resultArea.appendChild(section);
  };

  const runSimulation = async (event) => {
    event.preventDefault();
    const symbol = symbolField.value.trim();
    const from = document.getElementById('fromDate').value;
    const to = document.getElementById('toDate').value;
    const capital = Number(document.getElementById('capital').value) || 100000;
    const riskPercent = Number(document.getElementById('riskPercent').value) || 2;

    if (!symbol) {
      renderMessage('Please select a ticker symbol first.', 'error');
      return;
    }

    renderMessage('Running simulation...');
    runButton.disabled = true;

    const payload = {
      symbol,
      from,
      to,
      initialCapital: capital,
      riskPercent,
    };

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const error = contentType.includes('application/json')
          ? (await response.json()).error
          : await response.text();
        renderMessage(error || 'Simulation failed.', 'error');
        return;
      }

      const result = await response.json();
      renderSummary(result);
    } catch (err) {
      renderMessage(err.message || 'Simulation failed.', 'error');
    } finally {
      runButton.disabled = false;
    }
  };

  searchInput.addEventListener('input', (event) => {
    fetchSymbols(event.target.value);
  });

  form.addEventListener('submit', runSimulation);
}());
