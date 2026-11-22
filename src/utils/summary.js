/** Generates a nicely formatted WhatsApp/clipboard summary */
export function formatSummary(tally) {
  if (!tally) return '';

  const { drinks, members, counts } = tally;
  const lines = [];

  lines.push('☕ *Chai Time — Tea Break Order*');
  lines.push(`📅 ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}`);
  lines.push('');

  // Drink totals
  if (drinks && drinks.length > 0) {
    lines.push('*Drinks:*');
    for (const d of drinks) {
      lines.push(`  ${d.menuItem.emoji} ${d.menuItem.name}: ${d.total}`);
    }
    lines.push('');
    const totalOrdered = counts?.ordered || drinks.reduce((sum, d) => sum + d.total, 0);
    lines.push(`*Total: ${totalOrdered}*`);
  }

  // Skipping
  const skippers = members?.filter((m) => m.status === 'skipped') || [];
  if (skippers.length) {
    lines.push('');
    lines.push(`⏭️ Skipping: ${skippers.map((m) => m.name).join(', ')}`);
  }

  // Pending
  const pending = members?.filter((m) => m.status === 'pending') || [];
  if (pending.length) {
    lines.push('');
    lines.push(`⏳ Pending: ${pending.map((m) => m.name).join(', ')}`);
  }

  return lines.join('\n');
}

export function whatsappLink(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
