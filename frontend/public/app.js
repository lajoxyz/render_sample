const button = document.querySelector('#load');
const result = document.querySelector('#result');

button.addEventListener('click', async () => {
  button.disabled = true;
  result.textContent = 'Connecting to Render…';
  try {
    const response = await fetch('/api/', { signal: AbortSignal.timeout(95000) });
    if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
    result.textContent = JSON.stringify(await response.json(), null, 2);
  } catch (error) {
    result.textContent = `${error.message}. Please try again.`;
  } finally {
    button.disabled = false;
  }
});
