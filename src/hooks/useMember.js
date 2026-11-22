import { useState } from 'react';

const STORAGE_KEY = 'breakbuddy_member';

export function useMember() {
  // Read synchronously so the first render already knows the member (no picker flash)
  const [member, setMemberState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setMember = (m) => {
    setMemberState(m);
    if (m) localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
    else localStorage.removeItem(STORAGE_KEY);
  };

  return { member, setMember };
}
