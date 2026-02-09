
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: AppTab.DASHBOARD, label: 'Tổng quan', icon: 'fa-chart-pie' },
    { id: AppTab.SCHEDULE, label: 'Lịch giảng dạy', icon: 'fa-calendar-days' },
    { id: AppTab.TRAINING_MODULES, label: 'Học phần Đào tạo', icon: 'fa-graduation-cap' },
    { id: AppTab.CHAT, label: 'Trợ giảng AI', icon: 'fa-robot' },
    { id: AppTab.LESSON_PLANNER, label: 'Soạn bài giảng', icon: 'fa-book-open' },
    { id: AppTab.INTERNAL_DOCS, label: 'Tài liệu nội bộ', icon: 'fa-folder-tree' },
  ];

  const auxItems = [
    { id: AppTab.TRANSLATION, label: 'Dịch thuật kỹ thuật', icon: 'fa-language' },
    { id: AppTab.LAB_GUIDE, label: 'Hướng dẫn Lab', icon: 'fa-screwdriver-wrench' },
  ];

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div className="flex items-center justify-center border-b border-slate-800 h-16 bg-gradient-to-r from-blue-600 to-blue-500 shadow-md">
        <div className="flex items-center gap-3">
            <i className="fa-solid fa-network-wired text-xl"></i>
            <h1 className="text-lg font-bold tracking-wide">TELECOM AI</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Menu chính</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`}></i>
            {item.label}
          </button>
        ))}

        <div className="mt-8">
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Công cụ bổ trợ</p>
            {auxItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <i className={`fa-solid ${item.icon} w-5 text-center transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`}></i>
                    {item.label}
                </button>
            ))}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 text-white font-bold shadow-sm">
            GV
          </div>
          <div>
            <p className="text-sm font-medium">Giảng viên</p>
            <p className="text-xs text-slate-400">Khoa Viễn thông</p>
          </div>
        </div>
      </div>
    </div>
  );
};
