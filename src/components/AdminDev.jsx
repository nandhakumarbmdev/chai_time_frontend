import { useCallback, useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Ban, GitCommit, KeyRound, Rocket, Send } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Badge } from './Primitives.jsx';
import { devApi } from '../api/dev.js';
import { socket } from '../api/socket.js';

const KEY_STORAGE = 'chai_dev_admin_key';
const ACTIVE = ['queued', 'running', 'testing', 'deploying'];
const BADGE = {
  queued: 'default',
  running: 'yellow',
  testing: 'yellow',
  deploying: 'yellow',
  done: 'green',
  failed: 'red',
  cancelled: 'default',
};

const readKey = () => {
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
};
const saveKey = (k) => {
  try {
    k ? localStorage.setItem(KEY_STORAGE, k) : localStorage.removeItem(KEY_STORAGE);
  } catch {}
};

const when = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

export default function AdminDev() {
  const [status, setStatus] = useState(null); // { enabled, keyRequired, deploy }
  const [key, setKey] = useState(readKey);
  const [keyInput, setKeyInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [logs, setLogs] = useState({}); // jobId → string[]
  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);
  const selectedRef = useRef(null);
  selectedRef.current = selectedId;

  // 1. Is the feature on, and does it want a key?
  useEffect(() => {
    devApi
      .status()
      .then(setStatus)
      .catch((e) => setError(e.message));
  }, []);

  // 2. Load jobs (this is also the key check)
  const load = useCallback(async () => {
    try {
      const list = await devApi.list(key);
      setJobs(list);
      setAuthed(true);
      setError('');
    } catch (e) {
      setAuthed(false);
      setError(e.status === 401 ? (key ? 'That key was not accepted.' : '') : e.message);
      if (e.status === 401 && key) {
        saveKey('');
        setKey('');
      }
    }
  }, [key]);

  useEffect(() => {
    if (status?.enabled) load();
  }, [status, load]);

  // 3. Live updates
  useEffect(() => {
    if (!status?.enabled || !authed) return;

    const subscribe = () => socket.emit('dev:subscribe', { key }, () => {});
    const onJob = (job) =>
      setJobs((prev) => (prev.some((j) => j.id === job.id) ? prev.map((j) => (j.id === job.id ? job : j)) : [job, ...prev]));
    const onLog = ({ id, line }) => setLogs((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), line].slice(-500) }));
    const onReconnect = () => {
      subscribe();
      load();
      if (selectedRef.current) fetchLogs(selectedRef.current);
    };

    socket.on('connect', onReconnect);
    socket.on('dev:job', onJob);
    socket.on('dev:log', onLog);
    if (!socket.connected) socket.connect();
    else subscribe();

    return () => {
      socket.off('connect', onReconnect);
      socket.off('dev:job', onJob);
      socket.off('dev:log', onLog);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, authed, key]);

  // Full log history comes from the REST endpoint; live lines are appended by the socket
  function fetchLogs(id) {
    devApi
      .get(key, id)
      .then((j) => setLogs((prev) => ({ ...prev, [id]: j.logs ?? [] })))
      .catch(() => {});
  }

  function select(id) {
    setSelectedId(id);
    fetchLogs(id);
  }

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, selectedId]);

  async function submit(e) {
    e?.preventDefault();
    const text = prompt.trim();
    if (text.length < 5 || sending) return;
    setSending(true);
    try {
      const job = await devApi.create(key, text);
      setJobs((prev) => (prev.some((j) => j.id === job.id) ? prev : [job, ...prev]));
      setLogs((prev) => ({ ...prev, [job.id]: [] }));
      setSelectedId(job.id);
      setPrompt('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  async function cancel(id) {
    try {
      await devApi.cancel(key, id);
    } catch (err) {
      toast.error(err.message);
    }
  }

  function submitKey(e) {
    e.preventDefault();
    const k = keyInput.trim();
    if (!k) return;
    saveKey(k);
    setKey(k);
    setKeyInput('');
  }

  const selected = jobs.find((j) => j.id === selectedId);
  const busy = jobs.some((j) => ACTIVE.includes(j.status));

  // Fallback when the socket is blocked or down: poll while something is running
  useEffect(() => {
    if (!authed || !busy) return;
    const t = setInterval(() => {
      load();
      if (selectedRef.current) fetchLogs(selectedRef.current);
    }, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, busy, load]);

  return (
    <div className="min-h-screen bg-bg">
      <Toaster position="top-center" toastOptions={{ success: { duration: 1500 }, error: { duration: 3000 } }} />
      <main className="max-w-[720px] mx-auto px-5 py-6 space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl text-ink">Dev agent</h1>
          {authed && key && (
            <button
              className="text-sm underline text-ink"
              onClick={() => {
                saveKey('');
                setKey('');
                setAuthed(false);
              }}
            >
              Forget key
            </button>
          )}
        </header>

        {!status && !error && <p className="card p-4 text-ink">Connecting…</p>}
        {error && !status && <p className="card p-4 font-bold text-ink">Couldn't reach the server: {error}</p>}

        {status && !status.enabled && (
          <p className="card p-4 text-ink">
            The dev agent is switched off on this server. Set <code>DEV_AGENT_ENABLED=true</code> on the backend to use it.
          </p>
        )}

        {status?.enabled && !authed && (
          <form onSubmit={submitKey} className="card p-4 space-y-3">
            <p className="font-bold text-ink flex items-center gap-2">
              <KeyRound size={18} aria-hidden="true" /> Admin key required
            </p>
            {error && <p role="alert" className="text-sm text-ink">{error}</p>}
            <input
              type="password"
              autoComplete="off"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste ADMIN_KEY"
              className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-ink"
            />
            <Button type="submit" variant="primary" disabled={!keyInput.trim()}>
              Unlock
            </Button>
          </form>
        )}

        {status?.enabled && authed && (
          <>
            {status.deploy === 'main' && (
              <p className="card p-3 text-sm text-ink flex items-start gap-2">
                <Rocket size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                Changes that pass the checks are pushed straight to <b>main</b> and deployed.
              </p>
            )}
            {status.deploy === 'branch' && (
              <p className="card p-3 text-sm text-ink">Changes are pushed to a <b>dev/…</b> branch. Merge it to deploy.</p>
            )}
            {status.deploy === 'off' && (
              <p className="card p-3 text-sm text-ink">Deploy is off: changes are committed on the server only.</p>
            )}

            <form onSubmit={submit} className="card p-4 space-y-3">
              <label htmlFor="dev-prompt" className="font-bold text-ink">
                What should change in the backend?
              </label>
              <textarea
                id="dev-prompt"
                rows={4}
                maxLength={2000}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e);
                }}
                placeholder="e.g. Add a GET /api/menu/popular endpoint that returns the 3 most ordered drinks this week"
                className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-ink resize-y"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-ink/60">
                  {busy ? 'A job is running; yours will queue.' : '⌘/Ctrl + Enter to send'}
                </span>
                <Button type="submit" variant="primary" icon={Send} loading={sending} disabled={prompt.trim().length < 5}>
                  Run
                </Button>
              </div>
            </form>

            <section aria-label="Jobs" className="space-y-2">
              <h2 className="text-lg text-ink">Jobs</h2>
              {jobs.length === 0 && <p className="text-sm text-ink/60">No jobs yet.</p>}
              <ul className="space-y-2">
                {jobs.map((j) => (
                  <li key={j.id}>
                    <button
                      type="button"
                      onClick={() => select(j.id)}
                      aria-pressed={j.id === selectedId}
                      className={`card w-full text-left p-3 flex items-center gap-3 ${
                        j.id === selectedId ? 'ring-2 ring-tea-500' : ''
                      }`}
                    >
                      <span className="flex-1 min-w-0 text-ink truncate">{j.prompt}</span>
                      <span className="text-xs text-ink/60 shrink-0">{when(j.createdAt)}</span>
                      <Badge variant={BADGE[j.status]}>{j.deployed ? 'deployed' : j.status}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {selected && (
              <section aria-label="Job details" className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-ink whitespace-pre-wrap break-words">{selected.prompt}</p>
                  {ACTIVE.includes(selected.status) && (
                    <Button variant="secondary" icon={Ban} onClick={() => cancel(selected.id)}>
                      Cancel
                    </Button>
                  )}
                </div>

                <pre
                  ref={logRef}
                  className="bg-black/80 text-green-100 text-xs rounded-xl p-3 max-h-72 overflow-auto whitespace-pre-wrap break-words"
                >
                  {(logs[selected.id] ?? []).join('\n') || 'Waiting for output…'}
                </pre>

                {selected.error && <p role="alert" className="text-sm font-bold text-ink">❌ {selected.error}</p>}
                {selected.summary && <p className="text-sm text-ink whitespace-pre-wrap">{selected.summary}</p>}
                {selected.changedFiles?.length > 0 && (
                  <p className="text-sm text-ink">
                    <b>Files:</b> {selected.changedFiles.join(', ')}
                  </p>
                )}
                {selected.commit && (
                  <p className="text-sm text-ink flex items-center gap-1">
                    <GitCommit size={14} aria-hidden="true" /> {selected.commit}
                    {selected.deployed
                      ? ' · pushed to main'
                      : selected.status === 'done'
                        ? status.deploy === 'branch'
                          ? ` · pushed to branch ${selected.branch}`
                          : ' · committed on the server only'
                        : ''}
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
