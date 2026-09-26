import React from 'react'
import { useState } from 'react';
import {ClipboardMinus, CircleCheck, Clock, TriangleAlert} from 'lucide-react'

const StatCard = ({
  totalTasks,
  completedTasks, 
  inProgressTasks, 
  pendingTasks,
  tasks,
  setTasks,
  theme,
  userName
}) => {

  const [isAdding, setIsAdding] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: ""
  });

  const [errors, setErrors] = useState({});

  const isDark = theme === "dark";

  const stats = [
    { value: totalTasks, label: "Total Tasks", Icon: ClipboardMinus, bg: "bg-[#dff6fa]", color: "#0c7c92" },
    { value: completedTasks, label: "Completed", Icon: CircleCheck, bg: "bg-[#e3f5ec]", color: "#2f9e6e" },
    { value: inProgressTasks, label: "In Progress", Icon: Clock, bg: "bg-[#e7ecfd]", color: "#3651e0" },
    { value: pendingTasks, label: "Pending", Icon: TriangleAlert, bg: "bg-[#fbeedc]", color: "#d9922e" },
  ];

  return (
    <div className={`flex flex-col gap-2 w-full pl-0.5 ${isDark ? "bg-[#0f172a]" : "bg-[#f1f4f6]"}`}>

      <div className='flex flex-col'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0'>
      <h1 className={`text-2xl sm:text-3xl font-bold p-1 ${isDark ? "text-[#f1f5f9]" : "text-[#1b262c]"}`}>Hello, {userName}!</h1>

      <div className='rounded-lg flex justify-center items-center gap-3 hover:scale-97 w-full sm:w-auto'>
      <button 
      type="button"
      onClick={() => setIsAdding(true)}
      aria-label="Add new task"
      aria-haspopup="dialog"
      className='w-full sm:w-auto px-3 py-2 bg-[#0c7c92] text-white rounded-lg hover:scale-97 text-sm sm:text-base'>
        + Add New Task
        </button>
        </div>

      {isAdding && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-task-heading"
          className='fixed inset-bs-15 right-7 flex items-center justify-center z-50'
        >
        <div className={`shadow-lg p-5 rounded-lg mt-4 flex flex-col gap-3 border ${isDark ? "bg-[#1e293b] border-[#334155] text-[#f1f5f9]" : "bg-[#ffffff] border-[#e3e7ea] text-[#1b262c]"}`}>

          <h2 id="add-task-heading" className={`text-lg font-semibold ${isDark ? "text-[#f1f5f9]" : "text-[#1b262c]"}`}>Add New Task</h2>

          <label htmlFor="new-task-title" className='sr-only'>Task Title</label>
          <input
          id="new-task-title"
          type = "text"
          placeholder = 'Task Title'
          value = {newTask.title}
          onChange = {(e)=>
            setNewTask({
              ...newTask,
              title: e.target.value
            })
          }
          aria-label="Task title"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "new-task-title-error" : undefined}
          required
          className={`p-2 rounded-lg border outline-none focus:border-[#22b8cf] ${errors.title ? "border-[#b23a3a]" : isDark ? "border-[#334155]" : "border-[#e3e7ea]"} ${isDark ? "bg-[#0f172a] text-[#f1f5f9] placeholder-[#64748b]" : "text-[#1b262c] placeholder-[#8a97a0]"}`}
          />
          {errors.title && (
            <p id="new-task-title-error" className='text-xs text-[#b23a3a] -mt-2'>Title is mandatory.</p>
          )}

        <label htmlFor="new-task-description" className='sr-only'>Description</label>
        <input 
        id="new-task-description"
        type='text'
        placeholder = 'Description'
        value = {newTask.description}
        onChange={(e) => setNewTask({
          ...newTask,
          description: e.target.value
        })
        } 
        aria-label="Task description"
        aria-invalid={!!errors.description}
        aria-describedby={errors.description ? "new-task-description-error" : undefined}
        required
        className={`p-2 rounded-lg border outline-none focus:border-[#22b8cf] ${errors.description ? "border-[#b23a3a]" : isDark ? "border-[#334155]" : "border-[#e3e7ea]"} ${isDark ? "bg-[#0f172a] text-[#f1f5f9] placeholder-[#64748b]" : "text-[#1b262c] placeholder-[#8a97a0]"}`}
        />
        {errors.description && (
          <p id="new-task-description-error" className='text-xs text-[#b23a3a] -mt-2'>Description is mandatory.</p>
        )}

        <label htmlFor="new-task-priority" className='sr-only'>Priority</label>
        <select
        id="new-task-priority"
        value = {newTask.priority}
        onChange={(e) => 
          setNewTask({
            ...newTask,
            priority: e.target.value
          })
        }
        aria-label="Task priority"
        aria-invalid={!!errors.priority}
        aria-describedby={errors.priority ? "new-task-priority-error" : undefined}
        required
        className={`p-2 rounded-lg border outline-none focus:border-[#22b8cf] ${errors.priority ? "border-[#b23a3a]" : isDark ? "border-[#334155]" : "border-[#e3e7ea]"} ${isDark ? "bg-[#0f172a] text-[#f1f5f9]" : "text-[#1b262c] bg-white"}`}
        >
          <option value=''>Select priority</option>
          < option value='High'>High</option>
          <option value='Medium'>Medium</option>
          <option value='Low'>Low</option>
        </select>
        {errors.priority && (
          <p id="new-task-priority-error" className='text-xs text-[#b23a3a] -mt-2'>Priority chuno.</p>
        )}

        <label htmlFor="new-task-duedate" className='sr-only'>Due Date</label>
        <input
        id="new-task-duedate"
        type = 'date'
        value = {newTask.dueDate}
        onChange={(e) => 
          setNewTask ({
            ...newTask,
            dueDate: e.target.value
          })
        }
        aria-label="Task due date"
        aria-invalid={!!errors.dueDate}
        aria-describedby={errors.dueDate ? "new-task-duedate-error" : undefined}
        required
        min={new Date().toLocaleDateString("en-CA")}
        style={{ colorScheme: isDark ? "dark" : "light" }}
        className={`p-2 rounded-lg border outline-none focus:border-[#22b8cf] ${errors.dueDate ? "border-[#b23a3a]" : isDark ? "border-[#334155]" : "border-[#e3e7ea]"} ${isDark ? "bg-[#0f172a] text-[#f1f5f9]" : "text-[#1b262c]"}`}
        />
        {errors.dueDate && (
          <p id="new-task-duedate-error" className='text-xs text-[#b23a3a] -mt-2'>
            {!newTask.dueDate.trim() ? "Due date is mandatory." : "Past dates can’t be selected."}
          </p>
        )}

        <div className='flex gap-3'>
          <button 
          type='button'
          onClick = {() => {
            const todayStr = new Date().toLocaleDateString("en-CA");
            const newErrors = {
              title: !newTask.title.trim(),
              description: !newTask.description.trim(),
              priority: !newTask.priority.trim(),
              dueDate: !newTask.dueDate.trim() || newTask.dueDate < todayStr,
            };
            setErrors(newErrors);
            if (Object.values(newErrors).some(Boolean)) return;

            const task = {
              id: Date.now(),
              title: newTask.title,
              description: newTask.description,
              priority: newTask.priority,
              dueDate: newTask.dueDate,
              completed: false,
              inProgress: false
            }

            setTasks ([
              ...tasks, task
            ]);

            setNewTask({
              title: "",
              description: "",
              priority: "Medium",
              dueDate: ""
            });
            setErrors({});

            setIsAdding(false);
          }}
          aria-label="Confirm add task"
          className = 'bg-[#0c7c92] text-white px-4 py-2 rounded-lg hover:scale-95'
          > Add Task
          </button> 
          <button
          type='button'
          onClick={() => { setIsAdding(false); setErrors({}); }}
          aria-label="Cancel adding task"
          className={`px-4 py-2 rounded-lg hover:scale-95 ${isDark ? "bg-[#334155] text-[#94a3b8]" : "bg-[#f1f4f6] text-[#5b6b73]"}`}
          >Cancel</button>
            </div>
        </div>

        </div>
      )
}

      </div>
      <p className={`text-sm sm:text-base p-1 pb-2 sm:pb-3 ${isDark ? "text-[#94a3b8]" : "text-[#1b262c]"}`}>Let's get things done today!</p>
      </div>

      
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full'>
        {stats.map(({ value, label, Icon, bg, color }) => (
          <div
            key={label}
            className={`flex h-auto sm:min-h-[68px] rounded-lg px-3 py-2 sm:py-2.5 justify-start items-center gap-3 hover:scale-97 border ${isDark ? "bg-[#1e293b] border-[#334155]" : "bg-[#ffffff] border-[#e3e7ea]"}`}
          >
            <div className={`flex rounded-full p-2 shrink-0 ${bg}`}>
              <Icon size={22} color={color} aria-hidden="true" />
            </div>
            <div className='min-w-0'>
              <p className={`text-lg sm:text-2xl font-bold leading-tight ${isDark ? "text-[#f1f5f9]" : "text-[#1b262c]"}`}>{value}</p>
              <p className={`text-xs sm:text-sm truncate ${isDark ? "text-[#94a3b8]" : "text-[#1b262c]"}`}>{label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default StatCard