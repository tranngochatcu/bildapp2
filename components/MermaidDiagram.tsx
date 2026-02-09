import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: '"Be Vietnam Pro", sans-serif',
});

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (ref.current && chart) {
      const renderDiagram = async () => {
        try {
          // Clear previous content
          ref.current!.innerHTML = '';
          
          // Mermaid requires valid syntax. If it fails, it throws.
          const { svg } = await mermaid.render(containerId.current, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid render error:', error);
          if (ref.current) {
            ref.current.innerHTML = `
              <div class="bg-red-50 text-red-600 p-2 text-xs rounded border border-red-200">
                Lỗi hiển thị sơ đồ (Cú pháp không hợp lệ)
                <pre class="mt-1 overflow-x-auto text-[10px] text-gray-500">${chart}</pre>
              </div>
            `;
          }
        }
      };

      renderDiagram();
    }
  }, [chart]);

  return (
    <div className="flex justify-center my-4 overflow-x-auto p-4 bg-white border border-slate-100 rounded-lg shadow-sm">
      <div ref={ref} id={`container-${containerId.current}`} className="w-full text-center" />
    </div>
  );
};