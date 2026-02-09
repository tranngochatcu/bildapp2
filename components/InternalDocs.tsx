import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';

import { DocItem } from '../types';

interface InternalDocsProps {
  docs: DocItem[];
  setDocs: (docs: DocItem[]) => void;
}

// Mock Data removed (Lifted to App.tsx)

export const InternalDocs: React.FC<InternalDocsProps> = ({ docs, setDocs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  // const [docs, setDocs] = useState<DocItem[]>(MOCK_DOCS); // REMOVED
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const determineDocType = (fileName: string): DocItem['type'] => {
    const ext = fileName.split('.').pop()?.toUpperCase();
    if (ext === 'PDF') return 'PDF';
    if (['DOC', 'DOCX'].includes(ext || '')) return 'DOCX';
    if (['PPT', 'PPTX'].includes(ext || '')) return 'PPTX';
    return 'OTHER';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create object URL for download
    const fileUrl = URL.createObjectURL(file);

    // Simulate upload processing
    const newDoc: DocItem = {
      id: Date.now().toString(),
      name: file.name,
      type: determineDocType(file.name),
      date: new Date().toISOString().split('T')[0],
      size: formatFileSize(file.size),
      aiStatus: 'Processing', // Start with processing status
      category: 'Tham khảo', // Default category
      fileUrl: fileUrl // Store URL
    };

    // Add to top of list
    setDocs(prev => [newDoc, ...prev]);

    toast.success(`Đang tải lên: ${file.name}`);

    // Mock AI Processing delay
    setTimeout(() => {
      setDocs(currentDocs =>
        currentDocs.map(d =>
          d.id === newDoc.id ? { ...d, aiStatus: 'Synced' } : d
        )
      );
      toast.success(`AI đã học xong: ${file.name}`, {
        icon: '🧠',
        duration: 4000
      });
    }, 3000); // 3 seconds simulation

    // Reset input
    event.target.value = '';
  };

  const handleDownload = (doc: DocItem) => {
    if (doc.fileUrl) {
      // Download actual file if it was uploaded in this session
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Đang tải xuống: ${doc.name}`);
    } else {
      // Simulation for mock data
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: 'Đang chuẩn bị file...',
          success: `Đã tải xuống (Demo): ${doc.name}`,
          error: 'Lỗi tải xuống',
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      setDocs(prev => prev.filter(d => d.id !== id));
      toast.success('Đã xóa tài liệu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Synced': return 'bg-green-100 text-green-700 border-green-200';
      case 'Processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return 'fa-file-pdf text-red-500';
      case 'PPTX': return 'fa-file-powerpoint text-orange-500';
      case 'DOCX': return 'fa-file-word text-blue-500';
      default: return 'fa-file text-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-folder-tree text-blue-600"></i> Kho Tài liệu Nội bộ
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các giáo trình, slide và tài liệu tham khảo (Không mật). AI sẽ ưu tiên sử dụng kiến thức từ nguồn này.
          </p>
        </div>
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-all font-medium whitespace-nowrap active:scale-95"
        >
          <i className="fa-solid fa-cloud-arrow-up"></i> Tải tài liệu mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Giáo trình', 'Slide Bài giảng', 'Tài liệu Lab', 'Tham khảo'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterCategory === cat
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
            >
              {cat === 'All' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Tên tài liệu</th>
                <th className="px-6 py-4 w-32">Loại</th>
                <th className="px-6 py-4 w-40">Phân loại</th>
                <th className="px-6 py-4 w-32">Kích thước</th>
                <th className="px-6 py-4 w-32">Ngày tạo</th>
                <th className="px-6 py-4 w-40">AI Status</th>
                <th className="px-6 py-4 w-20 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                    <i className={`fa-solid ${getTypeIcon(doc.type)} text-xl`}></i>
                    {doc.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{doc.type}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{doc.size}</td>
                  <td className="px-6 py-4 text-slate-500">{doc.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doc.aiStatus)}`}>
                      {doc.aiStatus === 'Synced' && <i className="fa-solid fa-check mr-1"></i>}
                      {doc.aiStatus === 'Processing' && <i className="fa-solid fa-spinner animate-spin mr-1"></i>}
                      {doc.aiStatus === 'Pending' && <i className="fa-regular fa-clock mr-1"></i>}
                      {doc.aiStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-slate-400 hover:text-blue-600 transition-colors mx-1"
                      title="Tải xuống"
                    >
                      <i className="fa-solid fa-download"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors mx-1"
                      title="Xóa"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <i className="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>
                    <p>Không tìm thấy tài liệu phù hợp</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Hint */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 text-sm text-blue-800">
        <i className="fa-solid fa-circle-info mt-0.5 text-blue-600"></i>
        <div>
          <strong>Lưu ý quan trọng:</strong> Chỉ tải lên các tài liệu nội bộ không chứa thông tin mật cấp độ CAO/TUYỆT MẬT.
          AI sẽ tự động trích xuất nội dung từ các file có trạng thái "Synced" để trả lời câu hỏi của sinh viên.
        </div>
      </div>
    </div>
  );
};