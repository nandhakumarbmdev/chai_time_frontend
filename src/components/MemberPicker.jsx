import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client.js';
import toast from 'react-hot-toast';

export function MemberPicker({ onSelect }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getMembers()
      .then((d) => setMembers(d.members))
      .catch(() => toast.error('Could not load team list'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { member } = await api.createMember(newName.trim());
      onSelect(member);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card w-full max-w-sm p-6"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-tea-800 dark:text-tea-100">Chai Time</h1>
          <p className="text-tea-600 dark:text-tea-400 text-sm mt-1">Who are you? Pick your name!</p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl animate-pulse bg-tea-100 dark:bg-tea-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {members.map((m) => (
              <motion.button
                key={m._id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(m)}
                className="w-full text-left px-4 py-3 rounded-xl bg-tea-50 dark:bg-tea-900 
                           hover:bg-tea-100 dark:hover:bg-tea-800 font-medium text-tea-800 dark:text-tea-100
                           border border-tea-200 dark:border-tea-700 transition-colors"
              >
                {m.name}
              </motion.button>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-tea-200 dark:border-tea-700 pt-4">
          <AnimatePresence>
            {!adding ? (
              <motion.button
                key="add-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAdding(true)}
                className="w-full text-center text-tea-600 dark:text-tea-400 hover:text-tea-800 
                           dark:hover:text-tea-200 text-sm font-medium py-2 transition-colors"
              >
                + Add my name
              </motion.button>
            ) : (
              <motion.form
                key="add-form"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                onSubmit={handleAdd}
                className="flex gap-2"
              >
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your name…"
                  className="flex-1 px-3 py-2 rounded-xl border border-tea-300 dark:border-tea-600 
                             bg-white dark:bg-tea-900 text-tea-900 dark:text-tea-100 text-sm outline-none
                             focus:ring-2 focus:ring-tea-400"
                />
                <button
                  type="submit"
                  disabled={saving || !newName.trim()}
                  className="btn-primary text-sm py-2 disabled:opacity-50"
                >
                  {saving ? '…' : 'Add'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

