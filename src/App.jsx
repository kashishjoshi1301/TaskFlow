import { useState, useEffect, useMemo } from 'react'
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import FilterButtons from './components/FilterButtons';
import WelcomeScreen from './components/WelcomeScreen';
import CalendarView from './components/Calenderview';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const loadTasks = (name) => {
  if (!name) return [];
  try {
    const saved = localStorage.getItem(`taskflow-tasks-${name}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const loadImage = (name) => {
  if (!name) return null;
  try {
    return localStorage.getItem(`taskflow-profile-image-${name}`) || null;
  } catch {
    return null;
  }
};


const loadSeenReminders = (name) => {
  if (!name) return [];
  try {
    return JSON.parse(localStorage.getItem(`taskflow-reminder-seen-${name}`) || "[]");
  } catch {
    return [];
  }
};

const reminderSig = (r) => `${r.id}-${r.dueDate}-${r.when}`;

const PAGE_HEIGHT_CLASS = "h-[700px] overflow-y-auto";

const App = () => {
  const [userName, setUserName] = useState(() => localStorage.getItem("taskflow-username") || "");

  const [tasks, setTasks] = useState(() => loadTasks(localStorage.getItem("taskflow-username")));

  const [deletedStack, setDeletedStack] = useState([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("taskflow-theme") || "light");

  const [profileImage, setProfileImage] = useState(() => loadImage(localStorage.getItem("taskflow-username")));

  const [remindersEnabled, setRemindersEnabledState] = useState(
    () => localStorage.getItem("taskflow-reminders") !== "off"
  );
  const setRemindersEnabled = (value) => {
    setRemindersEnabledState(value);
    localStorage.setItem("taskflow-reminders", value ? "on" : "off");
    if (!value) setToast([]);
  };


  const [seenReminders, setSeenReminders] = useState(() =>
    loadSeenReminders(localStorage.getItem("taskflow-username"))
  );

  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState([]);
  const [showReminders, setShowReminders] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (PNG, JPG, etc.) — not a PDF or other document.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      try {
        localStorage.setItem(`taskflow-profile-image-${userName}`, reader.result);
      } catch {
        alert("Image bahut badi hai, chhoti image choose karo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    localStorage.removeItem(`taskflow-profile-image-${userName}`);
  };

  const handleNameSubmit = (name) => {
    localStorage.setItem("taskflow-username", name);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("taskflow-username");
    setDeletedStack([]);
    setActiveItem("Dashboard");
    setProfileImage(null);
    setTasks([]);
    setToast([]);
    setSeenReminders([]);
    setUserName("");
  };

  const handleRename = (raw) => {
    const newName = raw.trim();
    if (!newName) return "Name khali nahi ho sakta.";
    if (newName === userName) return null;

    
    const prefixes = ["taskflow-tasks-", "taskflow-profile-image-", "taskflow-notified-", "taskflow-reminder-seen-"];
    if (prefixes.some((p) => localStorage.getItem(p + newName) !== null)) {
      return "Ye naam already kisi aur user ke paas hai.";
    }

    try {
      localStorage.setItem(`taskflow-tasks-${newName}`, JSON.stringify(tasks));
      if (profileImage) localStorage.setItem(`taskflow-profile-image-${newName}`, profileImage);
      const notified = localStorage.getItem(`taskflow-notified-${userName}`);
      if (notified) localStorage.setItem(`taskflow-notified-${newName}`, notified);
      const seen = localStorage.getItem(`taskflow-reminder-seen-${userName}`);
      if (seen) localStorage.setItem(`taskflow-reminder-seen-${newName}`, seen);
    } catch {
      prefixes.forEach((p) => localStorage.removeItem(p + newName));
      return "Storage full hai, naam change nahi ho paya.";
    }

    prefixes.forEach((p) => localStorage.removeItem(p + userName));
    localStorage.setItem("taskflow-username", newName);
    setUserName(newName);
    return null;
  };

  const handleDeleteAccount = () => {
    ["taskflow-tasks-", "taskflow-profile-image-", "taskflow-notified-", "taskflow-reminder-seen-"].forEach((p) =>
      localStorage.removeItem(p + userName)
    );
    handleLogout();
  };

  useEffect(() => {
    if (!userName) return;
    setTasks(loadTasks(userName));
    setProfileImage(loadImage(userName));
    setSeenReminders(loadSeenReminders(userName)); // NEW
  }, [userName]);

  useEffect(() => {
    if (!userName) return;
    localStorage.setItem(`taskflow-tasks-${userName}`, JSON.stringify(tasks));
  }, [tasks, userName]);


  useEffect(() => {
    if (!userName) return;
    localStorage.setItem(`taskflow-reminder-seen-${userName}`, JSON.stringify(seenReminders));
  }, [seenReminders, userName]);

  useEffect(() => {
    localStorage.setItem("taskflow-theme", theme);
    document.body.style.backgroundColor = theme === "dark" ? "#0f172a" : "#f1f4f6";
  }, [theme]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (userName && remindersEnabled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [userName, remindersEnabled]);


  const reminders = useMemo(() => {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    return tasks
      .filter((task) => !task.completed && task.dueDate)
      .map((task) => {
        const due = parseLocalDate(task.dueDate);
        if (!due) return null;
        if (due.getTime() < startOfToday.getTime()) return { ...task, when: "overdue" };
        if (due.getTime() === startOfToday.getTime()) return { ...task, when: "today" };
        if (due.getTime() === startOfTomorrow.getTime()) return { ...task, when: "tomorrow" };
        return null;
      })
      .filter(Boolean);
  }, [tasks, now]);


  const unseenReminders = useMemo(
    () => reminders.filter((r) => !seenReminders.includes(reminderSig(r))),
    [reminders, seenReminders]
  );

  useEffect(() => {
    if (!userName || !remindersEnabled || reminders.length === 0) return;
    const storeKey = `taskflow-notified-${userName}`;
    let notified = [];
    try { notified = JSON.parse(localStorage.getItem(storeKey) || "[]"); } catch { notified = []; }

    const fresh = reminders.filter((r) => !notified.includes(reminderSig(r)));
    if (fresh.length === 0) return;

    fresh.forEach((r) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("TaskFlow reminder", {
          body: `"${r.title}" ${r.when === "overdue" ? "is overdue" : `is due ${r.when}`}. Time to complete it!`,
        });
      }
    });

    setToast((prev) => [...prev, ...fresh]);
    localStorage.setItem(
      storeKey,
      JSON.stringify([...notified, ...fresh.map(reminderSig)])
    );
  }, [reminders, userName, remindersEnabled]);

  const handleBellClick = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setShowReminders((prevOpen) => {
      const opening = !prevOpen;
      if (opening && reminders.length > 0) {
        setSeenReminders((prevSeen) =>
          Array.from(new Set([...prevSeen, ...reminders.map(reminderSig)]))
        );
      }
      return opening;
    });
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const inProgressTasks = tasks.filter((task) => !task.completed && task.inProgress).length;
  const pendingTasks = tasks.filter((task) => !task.completed && !task.inProgress).length;
  const importantTasks = tasks.filter((task) => task.priority === "High");

  if (!userName) {
    return <WelcomeScreen onNameSubmit={handleNameSubmit} />;
  }

  const isDark = theme === "dark";

  const filterProps = {
    setTasks,
    searchQuery,
    theme,
    deletedStack,
    setDeletedStack,
  };

  const whenLabel = (when) => (when === "overdue" ? "overdue" : `due ${when}`);
  const whenColor = (when) =>
    when === "today" || when === "overdue" ? "text-[#b23a3a]" : "text-[#8a5f0c]";

  return (
    <div className={`${isDark ? "bg-[#0f172a]" : "bg-[#f1f4f6]"} min-h-screen w-full`}>

      {toast.length > 0 && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-[60] w-[90%] max-w-sm rounded-lg border p-4 shadow-lg ${isDark ? "bg-[#1e293b] border-[#334155] text-[#f1f5f9]" : "bg-white border-[#e3e7ea] text-[#1b262c]"}`}
        >
          <div className='flex justify-between items-start gap-3'>
            <p className='font-semibold'>Reminder</p>
            <button
              type="button"
              onClick={() => setToast([])}
              aria-label="Dismiss reminders"
              className={isDark ? "text-[#94a3b8]" : "text-[#5b6b73]"}
            >✕</button>
          </div>
          <ul className='mt-2 flex flex-col gap-1 text-sm'>
            {toast.map((r) => (
              <li key={`${r.id}-${r.when}`}>
                "{r.title}" is <span className='font-semibold'>{whenLabel(r.when)}</span>. Please complete it.
              </li>
            ))}
          </ul>
        </div>
      )}

      {showReminders && (
        <div
          className={`fixed top-16 right-4 z-[60] w-[90%] max-w-sm rounded-lg border p-4 shadow-lg ${isDark ? "bg-[#1e293b] border-[#334155] text-[#f1f5f9]" : "bg-white border-[#e3e7ea] text-[#1b262c]"}`}
        >
          <div className='flex justify-between items-center mb-2'>
            <p className='font-semibold'>Reminders</p>
            <button
              type="button"
              onClick={() => setShowReminders(false)}
              aria-label="Close reminders"
              className={isDark ? "text-[#94a3b8]" : "text-[#5b6b73]"}
            >✕</button>
          </div>
          {reminders.length === 0 ? (
            <p className={`text-sm ${isDark ? "text-[#94a3b8]" : "text-[#5b6b73]"}`}>
              No tasks due today or tomorrow.
            </p>
          ) : (
            <ul className='flex flex-col gap-2 text-sm'>
              {reminders.map((r) => (
                <li key={`${r.id}-${r.when}`} className='flex justify-between gap-3'>
                  <span className='truncate'>{r.title}</span>
                  <span className={`shrink-0 font-semibold ${whenColor(r.when)}`}>
                    {r.when === "overdue" ? "Overdue" : `Due ${r.when}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className='flex flex-row gap-6 items-start relative'>
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className='fixed inset-0 bg-black/40 z-40 lg:hidden'
          ></div>
        )}

        <div
          className={`fixed lg:static top-0 left-0 h-screen z-50 transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <Sidebar
            activeItem={activeItem}
            setActiveItem={(item) => {
              setActiveItem(item);
              setIsSidebarOpen(false);
            }}
            theme={theme}
            userName={userName}
            profileImage={profileImage}
          />
        </div>

        <main className={`flex flex-col gap-4 lg:gap-6 w-full px-4 lg:px-0 lg:pr-6 pb-6 ${isDark ? "bg-[#0f172a]" : "bg-[#f1f4f6]"}`}>

          <Navbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            theme={theme}
            setTheme={setTheme}
            userName={userName}
            profileImage={profileImage}
            onProfileClick={() => setActiveItem("Profile")}
            reminderCount={unseenReminders.length}
            onBellClick={handleBellClick}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          {activeItem === "Dashboard" && (
            <div className={`${PAGE_HEIGHT_CLASS} flex flex-col gap-4 lg:gap-6`}>
              <div className="shrink-0">
                <StatCard
                totalTasks={totalTasks}
                completedTasks={completedTasks}
                inProgressTasks={inProgressTasks}
                pendingTasks={pendingTasks}
                tasks={tasks}
                setTasks={setTasks}
                theme={theme}
                userName={userName}
                />
              </div>
            <div className="flex-1 min-h-0 flex flex-col">
            <FilterButtons tasks={tasks} {...filterProps} />
            </div>
          </div>
        )}

          {activeItem === "My Tasks" && (
            <div className={`${PAGE_HEIGHT_CLASS} flex flex-col`}>
            <FilterButtons tasks={tasks} {...filterProps} />
            </div>
          )}

          {activeItem === "Important" && (
            <div className={`${PAGE_HEIGHT_CLASS} flex flex-col`}>
            <FilterButtons tasks={importantTasks} heading="Important Tasks" {...filterProps} />
            </div>
          )}
  
          {activeItem === "Profile" && (
            <div className={PAGE_HEIGHT_CLASS}>
              <ProfileView
                tasks={tasks}
                userName={userName}
                profileImage={profileImage}
                handleImageUpload={handleImageUpload}
                removeProfileImage={removeProfileImage}
                onLogout={handleLogout}
                theme={theme}
              />
            </div>
          )}

          {activeItem === "Calendar" && (
            <CalendarView
              tasks={tasks}
              setTasks={setTasks}
              theme={theme}
            />
          )}

          {activeItem === "Settings" && (
            <div className={PAGE_HEIGHT_CLASS}>
              <SettingsView
                theme={theme}
                setTheme={setTheme}
                userName={userName}
                tasks={tasks}
                setTasks={setTasks}
                onRename={handleRename}
                remindersEnabled={remindersEnabled}
                setRemindersEnabled={setRemindersEnabled}
                onDeleteAccount={handleDeleteAccount}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default App