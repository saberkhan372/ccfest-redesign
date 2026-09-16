/* Host integration: the "your time" column on the event page schedule.
   Times in the page are in the event's first zone (data-utc-offset); this adds a column
   for any time zone, defaulting to the visitor's own. Without JavaScript the
   Pacific and Eastern columns stand alone. */
(() => {
  const box = document.querySelector('.schedule[data-date]');
  if (!box || typeof Intl === 'undefined') return;
  const [y, mo, d] = box.dataset.date.split('-').map(Number);
  const offset = Number(box.dataset.utcOffset);
  const select = box.querySelector('select');
  const KEY = 'ccfest-schedule-zone';

  const zones = ['America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'America/Mexico_City',
    'America/Bogota', 'America/Sao_Paulo', 'Europe/London', 'Europe/Berlin', 'Africa/Lagos', 'Africa/Cairo',
    'Africa/Nairobi', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Singapore', 'Asia/Manila', 'Asia/Tokyo',
    'Australia/Sydney', 'Pacific/Auckland', 'UTC'];
  // Browsers still report some zones by their old names.
  const current = { 'Asia/Calcutta': 'Asia/Kolkata', 'Asia/Saigon': 'Asia/Ho_Chi_Minh', 'Asia/Katmandu': 'Asia/Kathmandu', 'Europe/Kiev': 'Europe/Kyiv', 'Asia/Rangoon': 'Asia/Yangon' };
  let own;
  try { own = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { own = 'UTC'; }
  own = current[own] || own;
  if (own && !zones.includes(own)) zones.unshift(own);
  let chosen = own;
  try { chosen = localStorage.getItem(KEY) || own; } catch (e) { /* storage blocked */ }
  if (!zones.includes(chosen)) chosen = own;

  const place = zone => zone === 'UTC' ? 'UTC' : zone.split('/').pop().replace(/_/g, ' ');
  for (const zone of zones) {
    const option = new Option(zone === own ? `${place(zone)} (your time zone)` : place(zone), zone);
    select.add(option);
  }
  select.value = chosen;

  // "HH:MM" in the event's zone -> a Date instant.
  const instant = hhmm => { const [h, m] = hhmm.split(':').map(Number); return new Date(Date.UTC(y, mo - 1, d, h - offset, m)); };
  const eventDay = new Date(Date.UTC(y, mo - 1, d, 12));

  function render() {
    const zone = select.value;
    const time = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' });
    const day = new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short', month: 'short', day: 'numeric' });
    const tzName = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).formatToParts(instant('12:00')).find(p => p.type === 'timeZoneName');
    box.querySelector('th.schedule-local').textContent = `${place(zone)}${tzName ? ` (${tzName.value})` : ''}`;
    for (const row of box.querySelectorAll('tbody tr')) {
      const start = instant(row.dataset.start), end = instant(row.dataset.end);
      const startDay = day.format(start);
      // Name the date whenever it isn't the event's own calendar day in that zone.
      const prefix = startDay !== new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format(eventDay) ? `${startDay}, ` : '';
      const cell = row.querySelector('td.schedule-local');
      const [a, b] = [time.format(start).toLowerCase(), time.format(end).toLowerCase()];
      // "9:00–9:30 am", but "11:30 am–12:00 pm" when the half of the day changes, as in the table.
      const sameHalf = a.slice(-2) === b.slice(-2);
      cell.textContent = `${prefix}${sameHalf ? a.slice(0, -3) : a}–${b}`;
      cell.dataset.label = place(zone);
    }
  }

  select.addEventListener('change', () => {
    try { localStorage.setItem(KEY, select.value); } catch (e) { /* storage blocked */ }
    render();
  });
  render();
  for (const el of box.querySelectorAll('.schedule-local, .schedule-zone')) el.hidden = false;
})();
