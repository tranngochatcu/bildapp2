import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import toast from 'react-hot-toast';

interface LessonPlannerProps {
  apiKey: string | null;
}

// Định nghĩa các mẫu bài giảng có sẵn
const DEFAULT_TEMPLATES = [
  {
    id: 'theory_standard',
    name: 'Lý thuyết Tiêu chuẩn',
    description: 'Phù hợp cho các bài giảng khái niệm, nguyên lý hoạt động.',
    structure: `# [Tên Bài Học]

## 1. Mục tiêu bài học (Mapping CLOs)
*   Liệt kê các CLO cần đạt.

## 2. Nội dung chính (Phân bổ thời gian: [Thời lượng])
| Phần | Nội dung | Đáp ứng CLO | Thời lượng | Hoạt động |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Giới thiệu & Khái niệm | ... | ... | Thuyết giảng |
| 2 | Nguyên lý hoạt động | ... | ... | Minh họa sơ đồ |

## 3. Chi tiết kiến thức
### 3.1. Khái niệm
(Giải thích chi tiết)

### 3.2. Sơ đồ nguyên lý
(Vẽ sơ đồ Mermaid minh họa luồng dữ liệu hoặc kiến trúc)

## 4. Tổng kết & Đánh giá
*   5 Câu hỏi trắc nghiệm ôn tập (Ghi rõ kiểm tra CLO nào).`
  },
  {
    id: 'practical_lab',
    name: 'Thực hành / Lab Guide',
    description: 'Tập trung vào hướng dẫn cấu hình, lệnh CLI và topo mạng.',
    structure: `# Lab: [Tên Bài Lab]

## 1. Mục tiêu (Mapping CLOs)
*   Kiến thức cần đạt (CLO Knowledge).
*   Kỹ năng cần đạt (CLO Skill).

## 2. Sơ đồ mạng (Topology)
(Vẽ sơ đồ kết nối các thiết bị bằng Mermaid graph TD)

## 3. Các bước cấu hình (Step-by-Step)
### Bước 1: Cấu hình cơ bản
(Các lệnh CLI)

## 4. Kiểm tra & Đánh giá (Assessment)
*   Bài tập kiểm tra kỹ năng (Checklist).`
  },
  {
    id: 'case_study',
    name: 'Phân tích Tình huống',
    description: 'Giải quyết vấn đề thực tế, thiết kế giải pháp mạng.',
    structure: `# Case Study: [Tên Tình Huống]

## 1. Mục tiêu phân tích (CLOs)
*   Vận dụng kiến thức để giải quyết vấn đề.

## 2. Bối cảnh doanh nghiệp
*   Mô tả hiện trạng mạng.

## 3. Đề xuất giải pháp
*   Sơ đồ triển khai (Mermaid).

## 4. Đánh giá giải pháp
*   So sánh hiệu quả.`
  }
];

export const LessonPlanner: React.FC<LessonPlannerProps> = ({ apiKey }) => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('45 phút');
  const [level, setLevel] = useState('Sinh viên năm 3 - Đại học');
  const [clos, setClos] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [generationType, setGenerationType] = useState<'outline' | 'full'>('outline');
  
  // Custom Template State
  const [customTemplateContent, setCustomTemplateContent] = useState('');
  const [customTemplateName, setCustomTemplateName] = useState('');
  
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine active structure
  const activeStructure = selectedTemplateId === 'custom' 
    ? customTemplateContent 
    : DEFAULT_TEMPLATES.find(t => t.id === selectedTemplateId)?.structure || '';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension roughly
    if (!file.name.match(/\.(txt|md|json)$/i)) {
      if (!window.confirm("File này có thể không phải định dạng văn bản (TXT/MD). Bạn có chắc chắn muốn tải lên để đọc nội dung không?")) {
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCustomTemplateContent(content);
      setCustomTemplateName(file.name);
      setSelectedTemplateId('custom'); // Switch to custom mode
      toast.success(`Đã tải lên mẫu: ${file.name}`);
    };
    reader.onerror = () => {
      toast.error("Không thể đọc file.");
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      toast.error("Vui lòng nhập API Key trước.");
      return;
    }
    if (!topic) {
        toast.error("Vui lòng nhập chủ đề bài giảng.");
        return;
    }
    if (!activeStructure) {
        toast.error("Vui lòng chọn mẫu hoặc nhập nội dung mẫu.");
        return;
    }

    setIsGenerating(true);
    setResult(''); // Clear old result

    try {
      const gemini = new GeminiService(apiKey);
      const plan = await gemini.generateLessonPlan(
        topic, 
        duration, 
        level, 
        activeStructure, 
        clos, 
        generationType // Pass generation type
      );
      setResult(plan);
      toast.success(generationType === 'outline' ? "Đã soạn xong đề cương!" : "Đã soạn xong nội dung chi tiết!");
    } catch (error) {
      toast.error("Lỗi khi tạo giáo án.");
    } finally {
      setIsGenerating(false);
    }
  };

  const insertCloSuggestion = (verb: string) => {
      const newClo = `CLO${(clos.match(/CLO/g) || []).length + 1}: ${verb} được...`;
      setClos(prev => prev ? `${prev}\n${newClo}` : newClo);
  };

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Form Section */}
      <div className="lg:col-span-1 space-y-5 overflow-y-auto pr-1">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <i className="fa-solid fa-pen-nib text-xl"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Soạn Bài Giảng</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Chủ đề / Tên bài học <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="VD: Giao thức định tuyến OSPF đa vùng"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Thời lượng</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option>45 phút</option>
                    <option>90 phút</option>
                    <option>135 phút</option>
                    <option>4 giờ</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Đối tượng</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option>Năm 1 (Đại cương)</option>
                    <option>Năm 2 (Cơ sở)</option>
                    <option>Năm 3 (Chuyên ngành)</option>
                    <option>Năm 4 (Đồ án)</option>
                  </select>
                </div>
            </div>

            {/* CLO Section */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-semibold text-slate-700">
                        Chuẩn đầu ra (CLOs)
                        <span className="ml-1 text-xs font-normal text-slate-500">(Bắt buộc với bài chuẩn)</span>
                    </label>
                    <div className="text-[10px] space-x-1">
                        <button type="button" onClick={() => insertCloSuggestion('Trình bày')} className="text-blue-600 hover:bg-blue-50 px-1 rounded border border-blue-100">Trình bày</button>
                        <button type="button" onClick={() => insertCloSuggestion('Phân tích')} className="text-blue-600 hover:bg-blue-50 px-1 rounded border border-blue-100">Phân tích</button>
                        <button type="button" onClick={() => insertCloSuggestion('Vận dụng')} className="text-blue-600 hover:bg-blue-50 px-1 rounded border border-blue-100">Vận dụng</button>
                    </div>
                </div>
                <textarea
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-24"
                    placeholder="CLO1: Trình bày được khái niệm...&#10;CLO2: Vận dụng được kỹ thuật...&#10;CLO3: Cấu hình thành công..."
                    value={clos}
                    onChange={(e) => setClos(e.target.value)}
                ></textarea>
            </div>

             {/* Generation Mode Selection */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Chế độ soạn thảo</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setGenerationType('outline')}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors border ${
                            generationType === 'outline' 
                            ? 'bg-white text-indigo-700 border-indigo-500 shadow-sm ring-1 ring-indigo-500' 
                            : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                        }`}
                    >
                        <i className="fa-solid fa-list-ul mr-1"></i> Đề cương (Outline)
                    </button>
                    <button
                        type="button"
                        onClick={() => setGenerationType('full')}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors border ${
                            generationType === 'full' 
                            ? 'bg-white text-indigo-700 border-indigo-500 shadow-sm ring-1 ring-indigo-500' 
                            : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                        }`}
                    >
                        <i className="fa-solid fa-file-pen mr-1"></i> Nội dung hoàn thiện
                    </button>
                </div>
            </div>

            <div>
               <label className="mb-2 block text-sm font-semibold text-slate-700">Chọn Mẫu / Cấu trúc</label>
               <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {/* Default Templates */}
                  {DEFAULT_TEMPLATES.map((tmpl) => (
                    <div 
                        key={tmpl.id}
                        onClick={() => setSelectedTemplateId(tmpl.id)}
                        className={`cursor-pointer rounded-lg border p-3 transition-all ${
                            selectedTemplateId === tmpl.id 
                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-800">{tmpl.name}</span>
                            {selectedTemplateId === tmpl.id && <i className="fa-solid fa-check-circle text-indigo-600"></i>}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{tmpl.description}</p>
                    </div>
                  ))}
                  
                  {/* Upload Custom Template Option */}
                  <div 
                        onClick={() => {
                            if (!customTemplateContent) fileInputRef.current?.click();
                            else setSelectedTemplateId('custom');
                        }}
                        className={`cursor-pointer rounded-lg border border-dashed p-3 transition-all flex flex-col items-center justify-center gap-2 text-center group ${
                            selectedTemplateId === 'custom' 
                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                        }`}
                  >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden"
                            accept=".txt,.md,.json"
                            onChange={handleFileUpload}
                        />
                        <div className="flex items-center gap-2">
                             <i className={`fa-solid ${selectedTemplateId === 'custom' && customTemplateContent ? 'fa-file-lines' : 'fa-cloud-arrow-up'} text-indigo-600`}></i>
                             <span className="font-bold text-sm text-indigo-700">
                                {selectedTemplateId === 'custom' && customTemplateName ? customTemplateName : 'Tải lên Mẫu cá nhân'}
                             </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            {selectedTemplateId === 'custom' && customTemplateContent 
                                ? 'Nhấn để chỉnh sửa nội dung bên dưới' 
                                : 'Hỗ trợ file Text (.txt) hoặc Markdown (.md)'}
                        </p>
                  </div>
               </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i> Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> 
                  {generationType === 'outline' ? 'Soạn Đề Cương' : 'Soạn Bài Giảng Chi Tiết'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Template Preview/Editor Box */}
        <div className="rounded-xl border border-slate-300 bg-white overflow-hidden flex flex-col h-48 shadow-sm">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                 <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <i className="fa-solid fa-code"></i> Cấu trúc mẫu (Preview)
                 </h4>
                 {selectedTemplateId === 'custom' && (
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-blue-600 hover:underline"
                     >
                        Chọn file khác
                     </button>
                 )}
            </div>
            
            {selectedTemplateId === 'custom' ? (
                 <textarea 
                    className="flex-1 w-full bg-white p-3 text-[11px] font-mono text-slate-900 resize-none outline-none focus:bg-indigo-50/30"
                    value={customTemplateContent}
                    onChange={(e) => setCustomTemplateContent(e.target.value)}
                    placeholder="Nội dung file mẫu sẽ hiển thị tại đây. Bạn có thể dán trực tiếp cấu trúc vào đây..."
                 />
            ) : (
                <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50">
                    <pre className="text-[10px] text-slate-600 whitespace-pre-wrap font-mono">
                        {activeStructure}
                    </pre>
                </div>
            )}
        </div>
      </div>

      {/* Result Section */}
      <div className="flex flex-col rounded-2xl bg-white shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden">
        <div className="border-b bg-slate-50 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">
            {generationType === 'outline' ? 'Đề cương đề xuất' : 'Nội dung bài giảng chi tiết'}
          </h3>
          {result && (
              <button 
                onClick={() => {navigator.clipboard.writeText(result); toast.success("Đã sao chép!")}}
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm"
              >
                  <i className="fa-regular fa-copy"></i> Sao chép
              </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[500px]">
          {result ? (
            <MarkdownRenderer content={result} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <i className="fa-solid fa-file-lines mb-4 text-6xl opacity-20"></i>
              <p>Nội dung giáo án (theo cấu trúc file/mẫu) sẽ hiển thị tại đây</p>
              <p className="text-sm mt-2">
                Chế độ: <span className="font-semibold text-slate-500">{generationType === 'outline' ? 'Đề cương' : 'Hoàn thiện chi tiết'}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};