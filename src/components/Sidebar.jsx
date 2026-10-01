import React from 'react'
import {
  LayoutDashboard,
  List,
  CalendarDays,
  Star,
  Settings,
  SquareCheck,
  User
} from 'lucide-react'

const Sidebar = ({ activeItem, setActiveItem, theme, userName, profileImage }) => {

  const sidebarItems = [
    { name: "Dashboard", label: "Go to Dashboard", Icon: LayoutDashboard },
    { name: "My Tasks", label: "Go to My Tasks", Icon: List },
    { name: "Calendar", label: "Go to Calendar", Icon: CalendarDays },
    { name: "Important", label: "Go to Important tasks", Icon: Star },
    { name: "Settings", label: "Go to Settings", Icon: Settings },
  ]

  const isDark = theme === "dark";

  const itemClass = (name) =>
    `flex flex-row w-50 mr-4 justify-start items-center p-1 rounded transition-all ${
      activeItem === name
        ? isDark
          ? "bg-[#1e293b] text-[#38bdf8] border-l-[3px] border-[#22b8cf]"
          : "bg-[#dff6fa] text-[#0a6b7d] border-l-[3px] border-[#22b8cf]"
        : isDark
        ? "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
        : "text-[#5b6b73] hover:text-[#1b262c] hover:bg-[#f1f4f6]"
    }`;

  return (
   
    <div className={`flex flex-col w-60 pl-6 pb-4 h-screen border-r ${isDark ? "bg-[#0f172a] border-[#334155]" : "bg-[#ffffff] border-[#e7e3ea]"}`}>

      <div className='flex flex-row items-center h-16 sm:h-[76px] shrink-0 gap-1 transition-all'>
        <SquareCheck size={35} color='#22b8cf' />
        <h1 className={`text-3xl font-semibold ${isDark ? "text-[#f1f5f9]" : "text-[#1b262c]"}`}>
          TaskFlow
        </h1>
      </div>

      <nav aria-label="Main navigation" className='flex flex-col gap-2 pt-4'>
        {sidebarItems.map(({ name, label, Icon }) => (
          <div key={name} className={itemClass(name)}>
            <Icon size={20} aria-hidden="true" />
            <button
              onClick={() => setActiveItem(name)}
              aria-label={label}
              aria-current={activeItem === name ? "page" : undefined}
              className='px-4 py-2 rounded-lg transition-all'
            >
              {name}
            </button>
          </div>
        ))}
      </nav>

      <div className='flex-1'></div>

      <button
        type="button"
        onClick={() => setActiveItem("Profile")}
        aria-label="Open profile"
        aria-current={activeItem === "Profile" ? "page" : undefined}
        className={`flex flex-row items-center gap-3 w-50 mr-4 p-2 rounded-lg transition-all text-left ${
          activeItem === "Profile"
            ? (isDark ? "bg-[#1e293b]" : "bg-[#dff6fa]")
            : (isDark ? "hover:bg-[#1e293b]" : "hover:bg-[#f1f4f6]")
        }`}
      >
        <div className={`w-10 h-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center border ${isDark ? "bg-[#334155] border-[#475569]" : "bg-[#dff6fa] border-[#e3e7ea]"}`}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" className='w-full h-full object-cover' />
          ) : (
            <User size={20} color={isDark ? "#94a3b8" : "#0c7c92"} />
          )}
        </div>

        <div className='flex flex-col min-w-0'>
          <p className={`text-sm font-semibold truncate ${isDark ? "text-[#f1f5f9]" : "text-[#1b262c]"}`}>{userName}</p>
          <p className={`text-xs truncate ${isDark ? "text-[#94a3b8]" : "text-[#5f6b76]"}`}>Free Plan</p>
        </div>
      </button>

    </div>
  )
}

export default Sidebar