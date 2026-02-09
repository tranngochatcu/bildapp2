import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MermaidDiagram } from './MermaidDiagram';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body text-sm md:text-base leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isMermaid = language === 'mermaid';

            if (!inline && isMermaid) {
              return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
            }

            return !inline && match ? (
              <div className="relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">{language}</span>
                </div>
                <pre className={`${className} !bg-slate-900 !text-slate-200 !p-4 !rounded-lg !my-4 shadow-sm overflow-x-auto`}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className={`${className} bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[0.9em] border border-slate-200`} {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
               <div className="overflow-x-auto my-6 border border-slate-200 rounded-xl shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 bg-white">
                    {children}
                  </table>
               </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-slate-50">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-6 py-4 whitespace-normal text-sm text-slate-700 border-b border-slate-100 last:border-0">
                {children}
              </td>
            );
          },
          a({ href, children }) {
             return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{children}</a>
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 space-y-1 my-3 text-slate-700">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 space-y-1 my-3 text-slate-700">{children}</ol>
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 bg-blue-50 text-slate-700 italic rounded-r">{children}</blockquote>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};