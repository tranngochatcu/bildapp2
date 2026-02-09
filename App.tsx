
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { LessonPlanner } from './components/LessonPlanner';
import { InternalDocs } from './components/InternalDocs';
import { TechnicalTranslation } from './components/TechnicalTranslation';
import { LabGuideAssistant } from './components/LabGuideAssistant';
import { TrainingModules } from './components/TrainingModules';
import { TeachingSchedule } from './components/TeachingSchedule';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toaster } from 'react-hot-toast';
import { AppTab, Message, Module, DocItem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

// MOCK DATA (Moved from components)
const MOCK_MODULES: Module[] = [
  {
    id: 'm1',
    code: 'NET101',
    name: 'Mạng Máy tính Căn bản',
    description: 'Kiến thức nền tảng về mô hình OSI, TCP/IP và các giao thức mạng.',
    lessons: [
      {
        id: 'l1',
        title: 'Tổng quan về Mạng máy tính & Internet',
        duration: '45 phút',
        lastUpdated: '20/02/2024',
        content: '# Tổng quan về Mạng máy tính\n\nMạng máy tính là tập hợp các thiết bị kết nối với nhau để chia sẻ tài nguyên.\n\n### Nội dung chính:\n1. Định nghĩa mạng\n2. Các thành phần của mạng\n3. Phân loại mạng (LAN, WAN, MAN)',
        attachmentType: 'none'
      },
      {
        id: 'l2',
        title: 'Video: Mô hình OSI & TCP/IP',
        duration: '90 phút',
        lastUpdated: '22/02/2024',
        content: 'Video bài giảng chi tiết so sánh hai mô hình tham chiếu quan trọng nhất trong mạng máy tính.',
        attachmentType: 'video',
        attachmentName: 'Lecture_OSI_Model.mp4',
        attachmentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // Sample video
      }
    ]
  },
  {
    id: 'm2',
    code: 'TEL302',
    name: 'Công nghệ 5G/6G',
    description: 'Tìm hiểu kiến trúc mạng di động thế hệ mới 5G Standalone và định hướng 6G.',
    lessons: [
      {
        id: 'l3',
        title: 'Tài liệu: Kiến trúc mạng 5G SA',
        duration: '120 phút',
        lastUpdated: '01/03/2024',
        content: 'Tài liệu PDF chi tiết về kiến trúc Service Based Architecture (SBA).',
        attachmentType: 'document',
        attachmentName: '5G_Architecture_Whitepaper.pdf'
      }
    ]
  },
  {
    id: 'm3',
    code: 'SEC401',
    name: 'An ninh Mạng nâng cao',
    description: 'Các kỹ thuật tấn công và phòng thủ mạng, cấu hình Firewall và IDS/IPS.',
    lessons: []
  }
];

const MOCK_DOCS: DocItem[] = [
  { id: '1', name: 'Giao trình Mạng Máy tính Nâng cao - 2024.pdf', type: 'PDF', date: '2024-02-15', size: '12.5 MB', aiStatus: 'Synced', category: 'Giáo trình' },
  { id: '2', name: 'Slide Chuong 4 - Dinh tuyen OSPF.pptx', type: 'PPTX', date: '2024-03-01', size: '5.2 MB', aiStatus: 'Synced', category: 'Slide Bài giảng' },
  { id: '3', name: 'Lab Guide - Cau hinh VLAN & Trunking.pdf', type: 'PDF', date: '2023-11-20', size: '3.1 MB', aiStatus: 'Synced', category: 'Tài liệu Lab' },
  { id: '4', name: 'Tieu chuan 3GPP Release 17.pdf', type: 'PDF', date: '2024-01-10', size: '45.8 MB', aiStatus: 'Processing', category: 'Tham khảo' },
  { id: '5', name: 'De cuong chi tiet mon hoc Vien thong so.docx', type: 'DOCX', date: '2023-09-05', size: '1.2 MB', aiStatus: 'Synced', category: 'Giáo trình' },
  { id: '6', name: 'Slide Chuong 5 - Mang 5G Core.pptx', type: 'PPTX', date: '2024-03-10', size: '8.4 MB', aiStatus: 'Pending', category: 'Slide Bài giảng' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persistent State
  const [messages, setMessages] = useLocalStorage<Message[]>('chat_history', [
    {
      id: 'welcome',
      role: 'model',
      content: 'Chào bạn! Tôi là trợ lý AI chuyên ngành Viễn thông. Tôi có thể giúp gì cho việc nghiên cứu, giảng dạy hoặc thực hành Lab của bạn hôm nay?',
      timestamp: Date.now(),
    },
  ]);

  const [modules, setModules] = useLocalStorage<Module[]>('training_modules', MOCK_MODULES);
  const [docs, setDocs] = useLocalStorage<DocItem[]>('internal_docs', MOCK_DOCS);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return (
          <Dashboard
            onNavigate={setActiveTab}
            stats={{
              messagesCount: messages.length,
              modulesCount: modules.length,
              docsCount: docs.length
            }}
          />
        );
      case AppTab.TRAINING_MODULES:
        return <TrainingModules apiKey={apiKey} modules={modules} setModules={setModules} />;
      case AppTab.SCHEDULE:
        return <TeachingSchedule />;
      case AppTab.CHAT:
        return <ChatInterface apiKey={apiKey} messages={messages} setMessages={setMessages} />;
      case AppTab.LESSON_PLANNER:
        return <LessonPlanner apiKey={apiKey} />;
      case AppTab.INTERNAL_DOCS:
        return <InternalDocs docs={docs} setDocs={setDocs} />;
      case AppTab.TRANSLATION:
        return <TechnicalTranslation apiKey={apiKey} />;
      case AppTab.LAB_GUIDE:
        return <LabGuideAssistant apiKey={apiKey} />;
      default:
        return (
          <Dashboard
            onNavigate={setActiveTab}
            stats={{
              messagesCount: messages.length,
              modulesCount: modules.length,
              docsCount: docs.length
            }}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <Toaster position="top-right" />

      {/* Sidebar - Hidden on mobile unless toggled (simplified for this demo) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600 hover:text-slate-900">
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
          <span className="font-bold text-slate-800">TeleCom AI</span>
          <div className="w-6"></div> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
          {renderContent()}
        </main>
      </div>

      {/* API Key Modal */}
      {!apiKey && <ApiKeyModal onSave={handleSetApiKey} />}
    </div>
  );
};

export default App;
