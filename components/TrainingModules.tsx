import React, { useState, useRef } from 'react';
import { Module, Lesson, AttachmentType } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import toast from 'react-hot-toast';

interface TrainingModulesProps {
  apiKey: string | null;
  modules: Module[];
  setModules: (modules: Module[]) => void;
}

// Mock Data removed (Lifted to App.tsx)

export const TrainingModules: React.FC<TrainingModulesProps> = ({ apiKey, modules, setModules }) => {
  // const [modules, setModules] = useState<Module[]>(MOCK_MODULES); // REMOVED
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(modules[0]?.id || null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(modules[0]?.lessons[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit States
  const [editContent, setEditContent] = useState('');
  const [editAttachment, setEditAttachment] = useState<{ url?: string, type: AttachmentType, name?: string }>({ type: 'none' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);

  // New Item States
  const [newModuleData, setNewModuleData] = useState({ code: '', name: '', description: '' });
  const [newLessonData, setNewLessonData] = useState({ title: '', duration: '45 phút' });

  const activeModule = modules.find(m => m.id === selectedModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === selectedLessonId);

  const handleLessonSelect = (lesson: Lesson) => {
    if (isEditing) {
      if (window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn chuyển bài học?')) {
        setIsEditing(false);
        setSelectedLessonId(lesson.id);
      }
    } else {
      setSelectedLessonId(lesson.id);
    }
  };

  const handleEdit = () => {
    if (activeLesson) {
      setEditContent(activeLesson.content);
      setEditAttachment({
        url: activeLesson.attachmentUrl,
        type: activeLesson.attachmentType || 'none',
        name: activeLesson.attachmentName
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (activeModule && activeLesson) {
      const updatedModules = modules.map(m => {
        if (m.id === activeModule.id) {
          return {
            ...m,
            lessons: m.lessons.map(l => l.id === activeLesson.id ? {
              ...l,
              content: editContent,
              lastUpdated: new Date().toLocaleDateString('vi-VN'),
              attachmentUrl: editAttachment.url,
              attachmentType: editAttachment.type,
              attachmentName: editAttachment.name
            } : l)
          };
        }
        return m;
      });
      setModules(updatedModules);
      setIsEditing(false);
      toast.success('Đã lưu bài giảng!');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type.startsWith('video/') ? 'video' : 'document';

    setEditAttachment({
      url: fileUrl,
      type: fileType,
      name: file.name
    });

    toast.success(`Đã tải lên: ${file.name}`);
  };

  const handleRemoveAttachment = () => {
    setEditAttachment({ type: 'none' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Create Module Logic ---
  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleData.code || !newModuleData.name) {
      toast.error("Vui lòng nhập Mã và Tên học phần");
      return;
    }
    const newModule: Module = {
      id: Date.now().toString(),
      code: newModuleData.code.toUpperCase(),
      name: newModuleData.name,
      description: newModuleData.description,
      lessons: []
    };
    setModules([...modules, newModule]);
    setSelectedModuleId(newModule.id);
    setSelectedLessonId(null);
    setShowModuleModal(false);
    setNewModuleData({ code: '', name: '', description: '' });
    toast.success("Đã thêm học phần mới");
  };

  // --- Create Lesson Logic ---
  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModule) return;
    if (!newLessonData.title) {
      toast.error("Vui lòng nhập Tên bài học");
      return;
    }

    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: newLessonData.title,
      duration: newLessonData.duration,
      lastUpdated: new Date().toLocaleDateString('vi-VN'),
      content: `# ${newLessonData.title}\n\n*Nhập mô tả cho bài giảng tại đây...*`,
      attachmentType: 'none'
    };

    const updatedModules = modules.map(m =>
      m.id === activeModule.id ? { ...m, lessons: [...m.lessons, newLesson] } : m
    );

    setModules(updatedModules);
    setSelectedLessonId(newLesson.id);
    setEditContent(newLesson.content);
    setEditAttachment({ type: 'none' });
    setIsEditing(true); // Switch to edit mode immediately
    setShowLessonModal(false);
    setNewLessonData({ title: '', duration: '45 phút' });
    toast.success("Đã thêm bài học mới");
  };

  return (
    <div className="flex h-full gap-6 relative">
      {/* Sidebar: Module List & Lessons */}
      <div className="w-80 flex flex-col gap-4 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-blue-600"></i> Học phần
            </h2>
            <button
              onClick={() => setShowModuleModal(true)}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              title="Thêm học phần mới"
            >
              <i className="fa-solid fa-plus"></i> Thêm
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {modules.map(module => (
              <div key={module.id} className="rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setSelectedModuleId(module.id)}
                  className={`w-full text-left p-3 flex items-center justify-between transition-colors ${selectedModuleId === module.id ? 'bg-blue-50 text-blue-700' : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold uppercase text-slate-400">{module.code}</div>
                    <div className="font-semibold truncate">{module.name}</div>
                  </div>
                  <i className={`fa-solid fa-chevron-right text-xs transition-transform ${selectedModuleId === module.id ? 'rotate-90 text-blue-500' : 'text-slate-300'}`}></i>
                </button>

                {selectedModuleId === module.id && (
                  <div className="bg-slate-50 p-2 space-y-1 border-t border-slate-100">
                    {module.lessons.length === 0 && (
                      <div className="text-xs text-slate-400 text-center py-2 italic">Chưa có bài học nào</div>
                    )}
                    {module.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(lesson)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${selectedLessonId === lesson.id
                          ? 'bg-white shadow-sm text-blue-600 font-medium border border-blue-100'
                          : 'text-slate-600 hover:bg-slate-200/50'
                          }`}
                      >
                        <i className={`fa-regular ${lesson.attachmentType === 'video' ? 'fa-circle-play' : 'fa-file-lines'} text-xs`}></i>
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setShowLessonModal(true)}
                      className="w-full text-center py-2 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded border border-dashed border-slate-300 hover:border-blue-300 transition-colors mt-2 flex items-center justify-center gap-1"
                    >
                      <i className="fa-solid fa-plus"></i> Thêm bài học
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {activeLesson ? (
          <>
            {/* Lesson Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-start bg-white">
              <div>
                <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{activeModule?.code}</span>
                  <span>/</span>
                  <span>{activeModule?.name}</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-800">{activeLesson.title}</h1>
                <div className="text-xs text-slate-400 mt-2 flex gap-4">
                  <span><i className="fa-regular fa-clock"></i> {activeLesson.duration}</span>
                  <span><i className="fa-regular fa-calendar"></i> Cập nhật: {activeLesson.lastUpdated}</span>
                  {activeLesson.attachmentType !== 'none' && (
                    <span className="text-blue-600">
                      <i className={`fa-solid ${activeLesson.attachmentType === 'video' ? 'fa-video' : 'fa-paperclip'} mr-1`}></i>
                      {activeLesson.attachmentName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium text-sm shadow-sm transition-colors"
                    >
                      <i className="fa-solid fa-save mr-1"></i> Lưu lại
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Chỉnh sửa
                  </button>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30">
              {isEditing ? (
                <div className="h-full flex flex-col p-6 gap-6">
                  {/* Attachment Section */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-paperclip text-blue-500"></i> Đính kèm bài giảng
                    </h3>

                    {editAttachment.type === 'none' ? (
                      <div
                        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-2"></i>
                        <p className="text-sm text-slate-600 font-medium">Nhấn để tải lên Video hoặc Tài liệu (PDF, PPTX, DOCX)</p>
                        <p className="text-xs text-slate-400 mt-1">Hỗ trợ các định dạng học liệu phổ biến</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-10 w-10 flex-shrink-0 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                            <i className={`fa-solid ${editAttachment.type === 'video' ? 'fa-video' : 'fa-file-lines'} text-lg`}></i>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-blue-900 truncate">{editAttachment.name}</p>
                            <p className="text-xs text-blue-600 uppercase">{editAttachment.type}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveAttachment}
                          className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          title="Xóa đính kèm"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="video/*,.pdf,.ppt,.pptx,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Markdown Editor */}
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                      Mô tả / Ghi chú bài giảng (Markdown)
                    </div>
                    <textarea
                      className="flex-1 w-full p-6 outline-none font-mono text-sm leading-relaxed resize-none"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Nhập mô tả chi tiết, ghi chú hoặc hướng dẫn học tập..."
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="p-8 max-w-5xl mx-auto space-y-8">
                  {/* Attachment Viewer */}
                  {activeLesson.attachmentType === 'video' && activeLesson.attachmentUrl && (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800">
                      <video controls className="w-full h-full" src={activeLesson.attachmentUrl}>
                        Trình duyệt của bạn không hỗ trợ thẻ video.
                      </video>
                    </div>
                  )}

                  {activeLesson.attachmentType === 'document' && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-2xl">
                          <i className="fa-solid fa-file-pdf"></i>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{activeLesson.attachmentName}</h3>
                          <p className="text-sm text-slate-500">Tài liệu tham khảo/Giáo trình</p>
                        </div>
                      </div>
                      <a
                        href={activeLesson.attachmentUrl}
                        download={activeLesson.attachmentName}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
                      >
                        <i className="fa-solid fa-download"></i> Tải về
                      </a>
                    </div>
                  )}

                  {/* Description Content */}
                  <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                      Nội dung chi tiết
                    </h3>
                    <MarkdownRenderer content={activeLesson.content} />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <i className="fa-solid fa-book-open-reader text-6xl mb-4 opacity-20"></i>
            <p>Chọn một bài học hoặc tạo mới để bắt đầu</p>
          </div>
        )}
      </div>

      {/* --- MODAL: Add Module --- */}
      {showModuleModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-2xl">
          <div className="w-96 bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Thêm Học phần mới</h3>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mã học phần</label>
                <input
                  type="text"
                  placeholder="VD: NET102"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                  value={newModuleData.code}
                  onChange={e => setNewModuleData({ ...newModuleData, code: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên học phần</label>
                <input
                  type="text"
                  placeholder="VD: Mạng máy tính nâng cao"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={newModuleData.name}
                  onChange={e => setNewModuleData({ ...newModuleData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mô tả ngắn</label>
                <textarea
                  placeholder="Mô tả nội dung chính..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-20"
                  value={newModuleData.description}
                  onChange={e => setNewModuleData({ ...newModuleData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Add Lesson --- */}
      {showLessonModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-2xl">
          <div className="w-96 bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Thêm Bài học mới</h3>
            <p className="text-xs text-slate-500 mb-4">Trong học phần: <span className="font-semibold text-blue-600">{activeModule?.name}</span></p>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên bài học</label>
                <input
                  type="text"
                  placeholder="VD: Cấu hình OSPF đa vùng"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={newLessonData.title}
                  onChange={e => setNewLessonData({ ...newLessonData, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Thời lượng dự kiến</label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={newLessonData.duration}
                  onChange={e => setNewLessonData({ ...newLessonData, duration: e.target.value })}
                >
                  <option value="45 phút">45 phút</option>
                  <option value="90 phút">90 phút</option>
                  <option value="120 phút">120 phút</option>
                  <option value="180 phút">180 phút</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium"
                >
                  Tạo bài học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};