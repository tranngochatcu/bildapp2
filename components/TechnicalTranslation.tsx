import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import toast from 'react-hot-toast';

interface TechnicalTranslationProps {
  apiKey: string | null;
}

export const TechnicalTranslation: React.FC<TechnicalTranslationProps> = ({ apiKey }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!apiKey) {
      toast.error("Vui lòng nhập API Key.");
      return;
    }
    if (!sourceText.trim()) {
      toast.error("Vui lòng nhập văn bản cần dịch.");
      return;
    }

    setIsTranslating(true);
    try {
      const gemini = new GeminiService(apiKey);
      const result = await gemini.translateTechnical(sourceText);
      setTranslatedText(result);
      toast.success("Dịch thuật hoàn tất!");
    } catch (error) {
      toast.error("Lỗi khi dịch văn bản.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-language text-blue-600"></i> Dịch thuật Kỹ thuật
        </h2>
        <p className="text-sm text-slate-500 mt-1">
            Hệ thống tự động nhận diện ngôn ngữ và dịch thuật chuyên ngành, giữ nguyên các thuật ngữ kỹ thuật. Hỗ trợ hiển thị bảng và sơ đồ trong bản dịch.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        {/* Source Panel */}
        <div className="flex flex-col rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                <span>Văn bản gốc (Anh/Việt)</span>
                {sourceText && (
                    <button 
                        onClick={() => setSourceText('')}
                        className="text-xs text-slate-400 hover:text-red-500"
                    >
                        Xóa
                    </button>
                )}
            </div>
            <textarea
                className="flex-1 p-4 resize-none focus:outline-none focus:bg-slate-50/50 transition-colors"
                placeholder="Nhập đoạn văn bản kỹ thuật cần dịch tại đây..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
            ></textarea>
        </div>

        {/* Target Panel */}
        <div className="flex flex-col rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                <span>Kết quả dịch thuật</span>
                {translatedText && (
                    <button 
                         onClick={() => {navigator.clipboard.writeText(translatedText); toast.success("Đã sao chép")}}
                         className="text-xs text-blue-600 hover:text-blue-800"
                    >
                        <i className="fa-regular fa-copy"></i> Sao chép
                    </button>
                )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30">
                {isTranslating ? (
                    <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                        <i className="fa-solid fa-circle-notch animate-spin"></i> Đang xử lý...
                    </div>
                ) : translatedText ? (
                    <MarkdownRenderer content={translatedText} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <i className="fa-solid fa-language text-4xl mb-2"></i>
                        <p>Bản dịch (bao gồm bảng biểu/sơ đồ) sẽ hiển thị ở đây</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="flex justify-center pb-4">
        <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center gap-2"
        >
            {isTranslating ? 'Đang dịch...' : 'Dịch ngay'} <i className="fa-solid fa-arrow-right-arrow-left"></i>
        </button>
      </div>
    </div>
  );
};