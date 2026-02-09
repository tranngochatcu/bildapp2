import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim().length > 10) {
      onSave(inputKey.trim());
    } else {
      alert("Vui lòng nhập API Key hợp lệ.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-key"></i> Cấu hình hệ thống
          </h2>
          <p className="mt-2 text-blue-100 text-sm">
            Để sử dụng Trợ lý AI, vui lòng nhập Google Gemini API Key của bạn.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Gemini API Key
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Key của bạn được lưu an toàn trong trình duyệt (LocalStorage).
            </p>
          </div>

          <div className="flex justify-end gap-3">
             <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="rounded-lg px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Lấy API Key ở đâu?
            </a>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all"
            >
              Lưu & Bắt đầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};