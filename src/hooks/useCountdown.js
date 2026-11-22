import { useState, useEffect } from 'react';

export function useCountdown(session) {
  const [display, setDisplay] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (!session) return;

    function tick() {
      const ms = session.msUntilCutoff - (Date.now() - startTs);
      if (ms <= 0) {
        setDisplay('Locked');
        setUrgent(true);
        return;
      }
      const totalSec = Math.ceil(ms / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const parts = [];
      if (h) parts.push(`${h}h`);
      if (m || h) parts.push(`${String(m).padStart(2, '0')}m`);
      parts.push(`${String(s).padStart(2, '0')}s`);
      setDisplay(parts.join(' '));
      setUrgent(ms < 5 * 60 * 1000); // < 5 min
    }

    const startTs = Date.now();
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  return { display, urgent };
}

