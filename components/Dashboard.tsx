import React from 'react';
import { AppTab } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onNavigate: (tab: AppTab) => void;
  stats: {
    messagesCount: number;
    modulesCount: number;
    docsCount: number;
  };
}

const data = [
  { name: 'Mạng Cơ bản', score: 85, avg: 70 },
  { name: 'Định tuyến', score: 65, avg: 75 },
  { name: 'Chuyển mạch', score: 90, avg: 72 },
  { name: 'An ninh mạng', score: 55, avg: 68 },
  { name: 'Viễn thông', score: 78, avg: 74 },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, stats }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="mb-2 text-3xl font-bold">Xin chào, Giảng viên! 👋</h1>
          <p className="max-w-xl text-blue-100">
            Hệ thống AI đã cập nhật 5 tài liệu mới về tiêu chuẩn 6G và báo cáo xu hướng SDN năm 2024.
            Bạn có 2 bài giảng cần chuẩn bị cho tuần tới.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => onNavigate(AppTab.CHAT)}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-blue-600 shadow transition-colors hover:bg-blue-50"
            >
              Hỏi đáp ngay
            </button>
            <button
              onClick={() => onNavigate(AppTab.LESSON_PLANNER)}
              className="rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Soạn bài mới
            </button>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <i className="fa-solid fa-users text-xl"></i>
          </div>
          <h3 className="text-sm font-medium text-slate-500">Sinh viên tích cực</h3>
          <p className="text-2xl font-bold text-slate-800">1,240</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <i className="fa-solid fa-book text-xl"></i>
          </div>
          <h3 className="text-sm font-medium text-slate-500">Mô-đun Đào tạo</h3>
          <p className="text-2xl font-bold text-slate-800">{stats.modulesCount}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <i className="fa-solid fa-folder-open text-xl"></i>
          </div>
          <h3 className="text-sm font-medium text-slate-500">Tài liệu Nội bộ</h3>
          <p className="text-2xl font-bold text-slate-800">{stats.docsCount}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <i className="fa-solid fa-comments text-xl"></i>
          </div>
          <h3 className="text-sm font-medium text-slate-500">Tin nhắn Chat</h3>
          <p className="text-2xl font-bold text-slate-800">{stats.messagesCount}</p>
        </div>
      </div>

      {/* Main Grid: Chart & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart Section */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Phân tích năng lực sinh viên (K64)</h3>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
              <option>Tuần này</option>
              <option>Tháng này</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="score" name="Điểm trung bình" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="avg" name="Mức chuẩn ngành" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Resources / Quick Links */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-800">Cập nhật công nghệ</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">ITU</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 hover:text-blue-600 cursor-pointer">IMT-2030 (6G) Framework</h4>
                  <p className="text-xs text-slate-500">Vừa cập nhật 2 giờ trước</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">CISCO</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 hover:text-blue-600 cursor-pointer">Silicon One Architecture</h4>
                  <p className="text-xs text-slate-500">Whitepaper mới</p>
                </div>
              </div>
            </div>
            <button className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Xem tất cả tin tức
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2">Tài liệu nội bộ</h3>
            <p className="text-sm opacity-90 mb-4">
              Hệ thống ưu tiên sử dụng giáo trình "Mạng Máy tính Nâng cao - 2024" để trả lời sinh viên.
            </p>
            <div className="flex items-center gap-2 text-xs bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <i className="fa-solid fa-check-circle"></i>
              <span>Đã đồng bộ {stats.docsCount} tài liệu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};