const form = document.getElementById('conditionsForm');
const $ = id => document.getElementById(id);

const labels = {
  weather: { clear: 'Clear weather', rain: 'Heavy rain', storm: 'Storm / cyclone warning', fog: 'Dense fog' },
  maintenance: { none: 'No maintenance', planned: 'Planned maintenance', urgent: 'Urgent repair required' },
  demand: { low: 'Low passenger demand', normal: 'Normal passenger demand', high: 'High passenger demand' }
};

function analyze(data) {
  const actions = [];
  const reasons = [];
  let score = 0;

  // Knowledge base: IF condition THEN operational recommendation.
  if (data.delay >= 60) {
    score += 3;
    actions.push('Notify passengers about the major delay through station announcements and digital display boards.');
    reasons.push('Delay is 60 minutes or more, so proactive passenger communication is required.');
  } else if (data.delay >= 15) {
    score += 1;
    actions.push('Monitor the train movement and provide updated estimated arrival times to passengers.');
    reasons.push('A delay of 15 minutes or more can affect connections and passenger plans.');
  } else {
    actions.push('Continue normal train monitoring and update the running status.');
    reasons.push('The reported delay is below 15 minutes.');
  }

  if (data.weather === 'storm') {
    score += 4;
    actions.push('Escalate to the railway control office and follow official severe-weather safety procedures; consider holding services until the route is confirmed safe.');
    reasons.push('A storm warning may create unsafe operating conditions.');
  } else if (data.weather === 'fog') {
    score += 2;
    actions.push('Apply the authorized low-visibility operating procedure and increase monitoring of train movement.');
    reasons.push('Dense fog reduces visibility and can affect safe train operation.');
  } else if (data.weather === 'rain') {
    score += 2;
    actions.push('Inspect vulnerable sections for waterlogging and monitor track conditions before dispatch decisions.');
    reasons.push('Heavy rain can affect track condition and visibility.');
  } else {
    reasons.push('Clear weather does not add a weather-related risk in this demo.');
  }

  if (data.maintenance === 'urgent') {
    score += 5;
    actions.push('Restrict use of the affected track and arrange an authorized engineering inspection before allowing trains through.');
    reasons.push('Urgent repair status is the highest-priority track safety condition.');
  } else if (data.maintenance === 'planned') {
    score += 2;
    actions.push('Coordinate the maintenance window with train control and consider an approved alternate route or revised timetable.');
    reasons.push('Planned work may reduce track availability.');
  } else {
    reasons.push('No track maintenance restriction has been reported.');
  }

  if (data.demand === 'high') {
    score += 2;
    actions.push('Review platform crowding, passenger capacity and the need for additional approved passenger-handling resources.');
    reasons.push('High demand may increase crowding and require capacity planning.');
  } else if (data.demand === 'low') {
    actions.push('Use the available passenger-demand information when planning staffing and platform resources.');
    reasons.push('Low demand may allow routine resource allocation, subject to operating requirements.');
  } else {
    actions.push('Maintain normal platform staffing and passenger-flow monitoring.');
    reasons.push('Passenger demand is at the normal level.');
  }

  const risk = score >= 7 ? 'High' : score >= 3 ? 'Moderate' : 'Low';
  return { actions, reasons, risk, score };
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = {
    delay: Number($('delay').value),
    weather: $('weather').value,
    maintenance: $('maintenance').value,
    demand: $('demand').value
  };
  if (!Number.isFinite(data.delay) || data.delay < 0 || data.delay > 300) {
    alert('Please enter a delay between 0 and 300 minutes.');
    return;
  }
  const result = analyze(data);
  $('emptyState').classList.add('hidden');
  $('report').classList.remove('hidden');
  $('scenarioStatus').textContent = 'Analyzed';
  $('riskStat').textContent = result.risk;
  $('recommendationCount').textContent = result.actions.length;
  $('riskText').textContent = result.risk + ' risk';
  $('riskEmoji').textContent = result.risk === 'High' ? '🚨' : result.risk === 'Moderate' ? '⚠️' : '✓';
  $('riskBanner').className = 'risk-banner ' + result.risk.toLowerCase();
  $('recommendations').innerHTML = result.actions.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  $('reasoning').innerHTML = `<b>Conditions considered:</b> ${data.delay} minute delay · ${labels.weather[data.weather]} · ${labels.maintenance[data.maintenance]} · ${labels.demand[data.demand]}<br><br>` +
    result.reasons.map(escapeHtml).join('<br>');
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

$('resetBtn').addEventListener('click', () => {
  form.reset();
  $('emptyState').classList.remove('hidden');
  $('report').classList.add('hidden');
  $('scenarioStatus').textContent = 'Ready';
  $('riskStat').textContent = '—';
  $('recommendationCount').textContent = '0';
});
