
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface ScheduleEvent {
  id: string;
  day: string; // "Thứ 2", "Thứ 3", etc.
  session: 'Sáng' | 'Chiều' | 'Tối';
  subject: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Preparation' | 'Meeting';
  time: string;
  note?: string;
}

const MOCK_SCHEDULE: ScheduleEvent[] = [
  { id: '1', day: 'Thứ 2', session: 'Sáng', subject: 'Mạng Máy tính Căn bản (NET101)', room: 'A2-304', type: 'Lecture', time: '07:00 - 11:30' },
  { id: '2', day: 'Thứ 3', session: 'Chiều', subject: 'Thực hành Mạng (LAB)', room: 'Phòng Lab 3', type: 'Lab', time: '12:30 - 15:30' },
  { id: '3', day: 'Thứ 4', session: 'Sáng', subject: 'Soạn giáo án 5G/6G', room: 'Tại nhà / Thư viện', type: 'Preparation', time: '08:00 - 11:00', note: 'Cập nhật tài liệu chương 3' },
  { id: '4', day: 'Thứ 5', session: 'Sáng', subject: 'An ninh Mạng (SEC401)', room: 'B1-102', type: 'Lecture', time: '07:00 - 09:30' },
  { id: '5', day: 'Thứ 6', session: 'Chiều', subject: 'Họp bộ môn Viễn thông', room: 'P. Họp 1', type: 'Meeting', time: '14:00 - 16:00' },
  { id: '6', day: 'Thứ 7', session: 'Sáng', subject: 'Soạn bài: OSPF Đa vùng', room: 'Tại nhà', type: 'Preparation', time: '09:00 - 11:00' },
];

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const SESSIONS = ['Sáng', 'Chiều', 'Tối'];

export const TeachingSchedule: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState('Tuần 35 (18/03 - 24/03/2024)');
  const [events, setEvents] = useState<ScheduleEvent[]>(MOCK_SCHEDULE);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
    day: 'Thứ 2',
    session: 'Sáng',
    type: 'Preparation'
  });

  const getEventsForCell = (day: string, session: string) => {
    return events.filter(e => e.day === day && e.session === session);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Lecture': return 'bg-blue-50 border-blue-500 text-blue-700';
      case 'Lab': return 'bg-orange-50 border-orange-500 text-orange-700';
      case 'Preparation': return 'bg-green-50 border-green-500 text-green-700';
      case 'Meeting': return 'bg-purple-50 border-purple-500 text-purple-700';
      default: return 'bg-gray-50 border-gray-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'Lecture': return 'fa-chalkboard-user';
        case 'Lab': return 'fa-network-wired';
        case 'Preparation': return 'fa-book-open-reader';
        case 'Meeting': return 'fa-users';
        default: return 'fa-calendar';
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newEvent.subject || !newEvent.time) {
        toast.error("Vui lòng nhập môn học và thời gian");
        return;
    }

    const eventToAdd: ScheduleEvent = {
        id: Date.now().toString(),
        day: newEvent.day || 'Thứ 2',
        session: newEvent.session as 'Sáng' | 'Chiều' | 'Tối',
        subject: newEvent.subject || '',
        room: newEvent.room || 'N/A',
        type: newEvent.type as any,
        time: newEvent.time || '',
        note: newEvent.note
    };

    setEvents([...events, eventToAdd]);
    setShowAddModal(false);
    setNewEvent({ day: 'Thứ 2', session: 'Sáng', type: 'Preparation' });
    toast.success("Đã thêm lịch mới");
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-calendar-days text-indigo-600"></i> Thời khóa biểu & Kế hoạch
          </h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
             <button className="hover:text-indigo-600"><i className="fa-solid fa-chevron-left"></i></button>
             <span className="font-semibold text-slate-700">{currentWeek}</span>
             <button className="hover:text-indigo-600"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
                <i className="fa-solid fa-plus"></i> Thêm lịch
            </button>
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                <i className="fa-solid fa-download"></i> Xuất Excel
            </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs overflow-x-auto pb-2">
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span>Giảng dạy (Lý thuyết)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
              <span>Thực hành (Lab)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>Soạn bài / Nghiên cứu</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
              <span>Họp / Công tác</span>
          </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
            <div className="p-4 text-center font-bold text-slate-400 text-sm border-r border-slate-200">
                Ca / Thứ
            </div>
            {DAYS.map(day => (
                <div key={day} className="p-4 text-center font-bold text-slate-700 text-sm border-r border-slate-200 last:border-r-0">
                    {day}
                </div>
            ))}
        </div>

        {/* Sessions Rows */}
        <div className="flex-1 overflow-y-auto">
            {SESSIONS.map(session => (
                <div key={session} className="grid grid-cols-8 border-b border-slate-100 min-h-[180px]">
                    {/* Session Label */}
                    <div className="p-4 flex flex-col items-center justify-center border-r border-slate-200 bg-slate-50/50">
                        <span className="font-bold text-slate-600">{session}</span>
                        <span className="text-xs text-slate-400 mt-1">
                            {session === 'Sáng' ? '07:00 - 11:30' : session === 'Chiều' ? '12:30 - 17:00' : '18:00 - 20:30'}
                        </span>
                    </div>

                    {/* Day Cells */}
                    {DAYS.map(day => {
                        const cellEvents = getEventsForCell(day, session);
                        return (
                            <div key={`${day}-${session}`} className="p-2 border-r border-slate-100 last:border-r-0 relative group hover:bg-slate-50 transition-colors">
                                {cellEvents.map(event => (
                                    <div 
                                        key={event.id} 
                                        className={`mb-2 p-2 rounded border-l-4 text-xs shadow-sm cursor-pointer hover:shadow-md transition-all ${getTypeStyle(event.type)}`}
                                    >
                                        <div className="font-bold mb-1 flex justify-between items-start">
                                            <span>{event.subject}</span>
                                            <i className={`fa-solid ${getIcon(event.type)} opacity-50`}></i>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-80 mb-0.5">
                                            <i className="fa-regular fa-clock text-[10px]"></i> {event.time}
                                        </div>
                                        {event.room !== 'N/A' && (
                                            <div className="flex items-center gap-1 opacity-80">
                                                <i className="fa-solid fa-location-dot text-[10px]"></i> {event.room}
                                            </div>
                                        )}
                                        {event.note && (
                                            <div className="mt-1 pt-1 border-t border-current border-opacity-20 italic opacity-90">
                                                "{event.note}"
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Quick Add Button on Hover */}
                                <button 
                                    onClick={() => {
                                        setNewEvent({ day, session: session as any, type: 'Preparation' });
                                        setShowAddModal(true);
                                    }}
                                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 text-indigo-600 p-1.5 rounded-full hover:bg-indigo-100"
                                    title="Thêm lịch vào ô này"
                                >
                                    <i className="fa-solid fa-plus text-xs"></i>
                                </button>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-96 animate-in fade-in zoom-in duration-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Thêm Lịch Mới</h3>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                      <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Loại công việc</label>
                          <select 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            value={newEvent.type}
                            onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                          >
                              <option value="Lecture">Giảng dạy (Lý thuyết)</option>
                              <option value="Lab">Thực hành (Lab)</option>
                              <option value="Preparation">Soạn bài / Nghiên cứu</option>
                              <option value="Meeting">Họp / Công tác</option>
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Thứ</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                value={newEvent.day}
                                onChange={(e) => setNewEvent({...newEvent, day: e.target.value})}
                            >
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Buổi</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                value={newEvent.session}
                                onChange={(e) => setNewEvent({...newEvent, session: e.target.value as any})}
                            >
                                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Tên môn / Nội dung</label>
                          <input 
                            type="text"
                            placeholder="VD: Mạng máy tính"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            value={newEvent.subject}
                            onChange={(e) => setNewEvent({...newEvent, subject: e.target.value})}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Thời gian</label>
                            <input 
                                type="text"
                                placeholder="07:00 - 09:00"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                value={newEvent.time}
                                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Phòng / Địa điểm</label>
                            <input 
                                type="text"
                                placeholder="VD: A2-304"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                value={newEvent.room}
                                onChange={(e) => setNewEvent({...newEvent, room: e.target.value})}
                            />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú (Tùy chọn)</label>
                          <input 
                            type="text"
                            placeholder="VD: Nhớ mang máy chiếu..."
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            value={newEvent.note}
                            onChange={(e) => setNewEvent({...newEvent, note: e.target.value})}
                          />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                              Hủy
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
                          >
                              Lưu
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
