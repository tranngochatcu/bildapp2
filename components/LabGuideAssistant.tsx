import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import toast from 'react-hot-toast';

interface LabGuideAssistantProps {
  apiKey: string | null;
}

export const LabGuideAssistant: React.FC<LabGuideAssistantProps> = ({ apiKey }) => {
  const [topic, setTopic] = useState('');
  const [tool, setTool] = useState('Cisco Packet Tracer');
  const [guide, setGuide] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      toast.error("Vui lòng nhập API Key.");
      return;
    }
    if (!topic.trim()) {
      toast.error("Vui lòng nhập chủ đề bài Lab.");
      return;
    }

    setIsGenerating(true);
    setGuide('');
    try {
      const gemini = new GeminiService(apiKey);
      const result = await gemini.generateLabGuide(topic, tool);
      setGuide(result);
      toast.success("Đã tạo hướng dẫn Lab!");
    } catch (error) {
      toast.error("Lỗi khi tạo hướng dẫn.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <i className="fa-solid fa-screwdriver-wrench text-indigo-600"></i> Tạo Hướng dẫn Lab
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Chủ đề bài Lab</label>
                    <input 
                        type="text" 
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="VD: Định tuyến VLAN trên Router Cisco"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Công cụ thực hiện</label>
                    <select 
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        value={tool}
                        onChange={(e) => setTool(e.target.value)}
                    >
                        <option value="Cisco Packet Tracer">Cisco Packet Tracer</option>
                        <option value="GNS3">GNS3</option>
                        <option value="EVE-NG">EVE-NG</option>
                        <option value="Thiết bị thật (Real Gear)">Thiết bị thật (Real Gear)</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isGenerating ? (
                        <><i className="fa-solid fa-circle-notch animate-spin"></i> Đang viết hướng dẫn...</>
                    ) : (
                        <><i className="fa-solid fa-wand-magic-sparkles"></i> Tạo Hướng dẫn</>
                    )}
                </button>
            </form>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-indigo-800 mb-2">Gợi ý bài Lab phổ biến:</h4>
            <div className="space-y-2">
                {[
                    "Cấu hình DHCP Server trên Router",
                    "Triển khai OSPF Single Area",
                    "Cấu hình Access Control List (ACL)",
                    "NAT Overload (PAT) ra Internet"
                ].map((item, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setTopic(item)}
                        className="block w-full text-left text-sm text-indigo-700 hover:bg-indigo-100 px-2 py-1.5 rounded transition-colors"
                    >
                        • {item}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-2 flex flex-col rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Nội dung Hướng dẫn</h3>
            {guide && (
                <button 
                    onClick={() => {navigator.clipboard.writeText(guide); toast.success("Đã sao chép!")}}
                    className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm"
                >
                    <i className="fa-regular fa-copy"></i> Sao chép Markdown
                </button>
            )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[500px]">
            {guide ? (
                <MarkdownRenderer content={guide} />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <i className="fa-solid fa-terminal text-6xl opacity-20 mb-4"></i>
                    <p>Nhập chủ đề và nhấn "Tạo Hướng dẫn" để bắt đầu</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};