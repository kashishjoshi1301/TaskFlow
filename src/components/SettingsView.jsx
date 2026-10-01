import React, { useState } from 'react'
import { Sun, Moon, Bell, User, Database, TriangleAlert } from 'lucide-react'

const Toggle = ({ checked, onChange, label, isDark }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
      checked ? "bg-[#22b8cf]" : isDark ? "bg-[#475569]" : "bg-[#cfd6db]"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
        checked ? "translate-x-5" : ""
      }`}
    />
  </button>
);

const Section = ({ icon: Icon, title, children, card, iconColor = "#0c7c92" }) => (
  <section className={`rounded-lg border p-4 sm:p-6 ${card}`}>
    <div className='flex items-center gap-2 mb-4'>
      <Icon size={20} color={iconColor} aria-hidden="true" />
      <h2 className='text-lg font-semibold'>{title}</h2>
    </div>
    <div className='flex flex-col gap-4'>{children}</div>
  </section>
);

const Row = ({ title, desc, muted, children }) => (
  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
    <div className='min-w-0'>
      <p className='font-medium'>{title}</p>
      {desc && <p className={`text-sm ${muted}`}>{desc}</p>}
    </div>
    <div className='shrink-0'>{children}</div>
  </div>
);

const SettingsView = ({
  theme,
  setTheme,
  userName,
  tasks,
  setTasks,
  onRename,
  remindersEnabled,
  setRemindersEnabled,
  onDeleteAccount,
}) => {
  const isDark = theme === "dark";

  const [nameInput, setNameInput] = useState(userName);
  const [nameMsg, setNameMsg] = useState(null);
  const [perm, setPerm] = useState(() =>
    "Notification" in window ? Notification.permission : "unsupported"
  );

  const card = isDark ? "bg-[#1e293b] border-[#334155] text-[#f1f5f9]" : "bg-white border-[#e3e7ea] text-[#1b262c]";
  const muted = isDark ? "text-[#94a3b8]" : "text-[#5b6b73]";
  const ghostBtn = `px-4 py-2 rounded-lg text-sm font-semibold hover:scale-95 ${
    isDark ? "bg-[#334155] text-[#f1f5f9]" : "bg-[#f1f4f6] text-[#1b262c]"
  }`;
  const primaryBtn = "px-4 py-2 rounded-lg text-sm font-semibold bg-[#0c7c92] text-white hover:scale-95";
  const dangerBtn = "px-4 py-2 rounded-lg text-sm font-semibold bg-[#fbe9e9] text-[#b23a3a] hover:scale-95";

  const completedCount = tasks.filter((t) => t.completed).length;

  const saveName = (e) => {
    e.preventDefault();
    const err = onRename(nameInput);
    setNameMsg(err ? { ok: false, text: err } : { ok: true, text: "Your name is updated." });
  };

  const askPermission = () => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(setPerm);
  };

  const exportTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskflow-${userName}-tasks.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearCompleted = () => {
    if (completedCount === 0) return;
    if (window.confirm(`${completedCount} Do you want to delete the completed tasks?`)) {
      setTasks((prev) => prev.filter((t) => !t.completed));
    }
  };

  const deleteAllTasks = () => {
    if (tasks.length === 0) return;
    if (window.confirm("All tasks will be deleted. Are you sure?")) setTasks([]);
  };

  const deleteAccount = () => {
    if (window.confirm(`"${userName}", your all data (tasks, photo, settings) will be deleted permanently.`)) {
      onDeleteAccount();
    }
  };

  const permText = {
    granted: "Browser notifications are on.",
    denied: "The browser has blocked it. Please allow it through the browser's site settings.",
    default: "Permission is not given..",
    unsupported: "This browser doesn't support notifications.",
  }[perm];

  return (
    <div className='w-full flex flex-col gap-4 h-[700px] overflow-y-auto'>
      <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-[#f1f5f9]" : "text-[#1b262c]"}`}>Settings</h1>

      <Section icon={isDark ? Moon : Sun} title="Appearance" card={card}>
        <Row title="Dark mode" desc="Select the mode." muted={muted}>
          <Toggle
            checked={isDark}
            onChange={(v) => setTheme(v ? "dark" : "light")}
            label="Toggle dark mode"
            isDark={isDark}
          />
        </Row>
      </Section>

      <Section icon={User} title="Account" card={card}>
        <form onSubmit={saveName} className='flex flex-col gap-2'>
          <label htmlFor="settings-name" className='font-medium'>Display name</label>
          <div className='flex flex-col sm:flex-row gap-2'>
            <input
              id="settings-name"
              type="text"
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); setNameMsg(null); }}
              className={`flex-1 p-2 rounded-lg border outline-none focus:border-[#22b8cf] ${
                isDark ? "bg-[#0f172a] border-[#334155] text-[#f1f5f9]" : "border-[#e3e7ea] text-[#1b262c]"
              }`}
            />
            <button type="submit" className={primaryBtn}>Save name</button>
          </div>
          {nameMsg && (
            <p role="status" className={`text-sm ${nameMsg.ok ? "text-[#1f7a45]" : "text-[#b23a3a]"}`}>
              {nameMsg.text}
            </p>
          )}
        </form>
      </Section>

      <Section icon={Bell} title="Reminders" card={card}>
        <Row
          title="Due-date reminders"
          desc="Add pop-ups and notifications for task(s) that are due today or tomorrow.."
          muted={muted}
        >
          <Toggle
            checked={remindersEnabled}
            onChange={setRemindersEnabled}
            label="Toggle reminders"
            isDark={isDark}
          />
        </Row>
        <Row title="Browser notifications" desc={permText} muted={muted}>
          {perm === "default" && (
            <button type="button" onClick={askPermission} className={ghostBtn}>Allow</button>
          )}
        </Row>
      </Section>

      <Section icon={Database} title="Your data" card={card}>
        <Row title="Export tasks" desc={`${tasks.length} Download the task(s) in JSON file.`} muted={muted}>
          <button type="button" onClick={exportTasks} disabled={tasks.length === 0} className={`${ghostBtn} disabled:opacity-40 w-35 disabled:cursor-not-allowed`}>
            Download
          </button>
        </Row>
        <Row title="Clear completed tasks" desc={`${completedCount} completed task(s).`} muted={muted}>
          <button type="button" onClick={clearCompleted} disabled={completedCount === 0} className={`${ghostBtn} disabled:opacity-40 w-35 disabled:cursor-not-allowed`}>
            Clear
          </button>
        </Row>
      </Section>

      <Section icon={TriangleAlert} title="Danger zone" card={card} iconColor="#b23a3a">
        <Row title="Delete all tasks" desc="All tasks will be removed, but your account will remain." muted={muted}>
          <button type="button" onClick={deleteAllTasks} disabled={tasks.length === 0} className={`${dangerBtn} disabled:opacity-40 w-35 disabled:cursor-not-allowed`}>
            Delete tasks
          </button>
        </Row>
        <Row title="Delete account" desc="All tasks, photos, and settings belonging to this user will be deleted." muted={muted}>
          <button type="button" onClick={deleteAccount}
          className={`w-35 ${dangerBtn}`}>
          Delete account
          </button>
        </Row>
      </Section>
    </div>
  );
};

export default SettingsView