import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dotColor = { High: "bg-[#b23a3a]", Medium: "bg-[#d9922e]", Low: "bg-[#2f9e6e]" };

const CalendarView = ({ tasks, setTasks, theme }) => {
  const isDark = theme === "dark";
  const todayKey = toKey(new Date());

  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayKey);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      (map[t.dueDate] = map[t.dueDate] || []).push(t);
    });
    return map;
  }, [tasks]);

  const selectedTasks = tasksByDate[selected] || [];

  const goMonth = (delta) => setCursor(new Date(year, month + delta, 1));
  const goToday = () => {
    const d = new Date();
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(todayKey);
  };

  const toggleDone = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const card = isDark ? "bg-[#1e293b] border-[#334155] text-[#f1f5f9]" : "bg-white border-[#e3e7ea] text-[#1b262c]";
  const muted = isDark ? "text-[#94a3b8]" : "text-[#5b6b73]";
  const navBtn = `p-2 rounded-lg hover:scale-95 ${isDark ? "bg-[#334155] text-[#f1f5f9]" : "bg-[#f1f4f6] text-[#1b262c]"}`;

  const selectedLabel = (() => {
    const [y, m, d] = selected.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  })();

  return (
    
    <div className={`w-full flex flex-col h-[700px] overflow-y-auto rounded-sm border p-1.5 sm:p-2 ${card}`}>
      <div className='flex items-center justify-between gap-3 mb-4'>
        <h1 className='text-xl sm:text-2xl font-bold'>
          {cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </h1>
        <div className='flex items-center gap-2'>
          <button type="button" onClick={goToday} className={`px-3 py-2 text-sm rounded-lg hover:scale-95 ${isDark ? "bg-[#334155]" : "bg-[#dff6fa] text-[#0a6b7d]"}`}>
            Today
          </button>
          <button type="button" onClick={() => goMonth(-1)} aria-label="Previous month" className={navBtn}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => goMonth(1)} aria-label="Next month" className={navBtn}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1 mb-1'>
        {WEEKDAYS.map((d) => (
          <div key={d} className={`text-center text-xs sm:text-sm font-semibold py-1 ${muted}`}>{d}</div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const key = `${year}-${pad(month + 1)}-${pad(day)}`;
          const dayTasks = tasksByDate[key] || [];
          const isSelected = key === selected;
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-label={`${day} ${cursor.toLocaleDateString("en-IN", { month: "long" })}, ${dayTasks.length} tasks`}
              aria-pressed={isSelected}
              className={`h-18 sm:h-20 rounded-lg border p-1 sm:p-2 flex flex-col items-start justify-between text-left transition-all
                ${isSelected
                  ? "bg-[#0c7c92] border-[#0c7c92] text-white"
                  : isDark
                  ? "border-[#334155] hover:bg-[#334155]"
                  : "border-[#e3e7ea] hover:bg-[#f1f4f6]"}
                ${isToday && !isSelected ? "ring-2 ring-[#22b8cf]" : ""}`}
            >
              <span className='text-xs sm:text-sm font-semibold'>{day}</span>

              {dayTasks.length > 0 && (
                <div className='flex items-center gap-0.5 sm:gap-1 flex-wrap'>
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${t.completed ? "bg-[#94a3b8]" : dotColor[t.priority] || "bg-[#94a3b8]" }`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className='text-[10px] font-semibold'>+{dayTasks.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className={`flex flex-wrap gap-4 mt-4 text-xs ${muted}`}>
        <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-full bg-[#b23a3a]' /> High</span>
        <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-full bg-[#d9922e]' /> Medium</span>
        <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-full bg-[#2f9e6e]' /> Low</span>
        <span className='flex items-center gap-1'><span className='w-2 h-2 rounded-full bg-[#94a3b8]' /> Completed</span>
      </div>

      {/* Selected day's tasks */}
      <div className={`mt-6 pt-4 border-t ${isDark ? "border-[#334155]" : "border-[#e3e7ea]"}`}>
        <h2 className='font-semibold mb-3'>{selectedLabel}</h2>

        {selectedTasks.length === 0 ? (
          <p className={`text-sm ${muted}`}>No tasks due on this day.</p>
        ) : (
          <ul className='flex flex-col'>
            {selectedTasks.map((t) => (
              <li key={t.id} className={`flex items-start gap-3 py-3 border-b ${isDark ? "border-[#334155]" : "border-[#e3e7ea]"}`}>
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleDone(t.id)}
                  aria-label={`Mark "${t.title}" as ${t.completed ? "incomplete" : "complete"}`}
                  className='w-5 h-5 mt-0.5 cursor-pointer accent-[#22b8cf] shrink-0'
                />
                <div className='min-w-0 flex-1'>
                  <p className={`font-semibold ${t.completed ? "line-through" : ""}`}>{t.title}</p>
                  {t.description && <p className={`text-sm ${muted}`}>{t.description}</p>}
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
                  t.priority === "High" ? "bg-[#fdeaea] text-[#b23a3a]"
                  : t.priority === "Medium" ? "bg-[#fdf2df] text-[#8a5f0c]"
                  : "bg-[#e4f7ea] text-[#1f7a45]"
                }`}>
                  {t.priority}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}

export default CalendarView