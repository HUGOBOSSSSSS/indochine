/**
 * Horaires : rendu du tableau hebdomadaire + statut "ouvert/fermé" en temps réel.
 */

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function isExceptionallyClosed(hoursData, now) {
  const todayISO = now.toISOString().slice(0, 10);
  return (hoursData.exceptionalClosures || []).some((c) => c.date === todayISO);
}

function getTodaySchedule(hoursData, now) {
  return hoursData.schedule.find((d) => d.day === now.getDay());
}

/**
 * Détermine si le restaurant est actuellement ouvert et calcule un message
 * informatif (prochaine ouverture/fermeture).
 */
export function computeOpenStatus(hoursData, now = new Date()) {
  if (isExceptionallyClosed(hoursData, now)) {
    return { isOpen: false, message: 'Fermé aujourd\'hui (jour férié)' };
  }

  const today = getTodaySchedule(hoursData, now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (today && !today.isClosed) {
    for (const slot of today.slots) {
      const open = timeToMinutes(slot.open);
      const close = timeToMinutes(slot.close);
      if (nowMinutes >= open && nowMinutes < close) {
        return { isOpen: true, message: `Ouvert jusqu'à ${slot.close}` };
      }
    }
    // Pas encore ouvert aujourd'hui : trouver le prochain créneau
    const nextSlot = today.slots.find((slot) => timeToMinutes(slot.open) > nowMinutes);
    if (nextSlot) {
      return { isOpen: false, message: `Fermé · ouvre à ${nextSlot.open}` };
    }
  }

  return { isOpen: false, message: 'Fermé actuellement' };
}

export function renderStatusPill(hoursData, el) {
  if (!el) return;
  const { isOpen, message } = computeOpenStatus(hoursData);
  el.dataset.status = isOpen ? 'open' : 'closed';
  el.innerHTML = `<span class="status-pill__dot" aria-hidden="true"></span>${message}`;
}

export function renderHoursTable(hoursData, el) {
  if (!el) return;
  const today = new Date().getDay();

  el.innerHTML = hoursData.schedule
    .map((day) => {
      const hoursText = day.isClosed
        ? 'Fermé'
        : day.slots.map((s) => `${s.open} – ${s.close}`).join(' / ');
      return `<tr data-today="${day.day === today}">
        <td>${day.label}</td>
        <td>${hoursText}</td>
      </tr>`;
    })
    .join('');
}
