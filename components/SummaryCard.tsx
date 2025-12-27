
import React, { useState } from 'react';
import { SummaryResult } from '../types';

interface SummaryCardProps {
  result: SummaryResult;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ result }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Safe defaults
  const title = result.title || "Wisdom Extraction";
  const paragraph = result.paragraph || "Analysis complete, but no text summary was provided.";
  const bullets = result.bullets || [];
  const insights = result.insights || [];
  const language = result.language || "Unknown";

  const formatTextForClipboard = () => {
    return `
LinkSense AI | Content Wisdom
------------------------------
Title: ${title}
Source: ${result.url}

Summary:
${paragraph}

Key Takeaways:
${bullets.map(b => `• ${b}`).join('\n')}

Mentor AI Intelligent Insights:
${insights.map(i => `✦ ${i}`).join('\n')}

Language: ${language}
Generated via LinkSense AI
    `.trim();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatTextForClipboard());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleExportText = () => {
    const text = formatTextForClipboard();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linksense_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    a.click();
  };

  const efficiency = result.readingTimeOriginal > 0 
    ? Math.round(((result.readingTimeOriginal - result.readingTimeSummary) / result.readingTimeOriginal) * 100)
    : 0;

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/30 border border-gray-100 hover:border-indigo-200 transition-all duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div className="max-w-2xl">
           <div className="flex items-center gap-3 mb-3">
             <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
               {language}
             </span>
             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified by Mentor AI</p>
           </div>
           <h2 className="text-3xl font-black text-gray-900 leading-[1.1] tracking-tight mb-2">{title}</h2>
           <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-600 truncate block max-w-sm transition-colors font-medium">
             {result.url}
           </a>
        </div>
        <div className="flex flex-col items-end">
           <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 min-w-[120px]">
             <p className="text-[10px] font-black uppercase tracking-tighter opacity-70 leading-none mb-1 text-center">Efficiency Gain</p>
             <p className="text-xl font-black text-center">+{efficiency}%</p>
           </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="relative">
          <div className="absolute -left-6 top-0 text-indigo-100 select-none opacity-50">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.895 14.912 16 16.017 16H19.017V14C19.017 11.239 16.778 9 14.017 9V7C17.883 7 21.017 10.134 21.017 14V21H14.017ZM3.017 21L3.017 18C3.017 16.895 3.912 16 5.017 16H8.017V14C8.017 11.239 5.778 9 3.017 9V7C6.883 7 10.017 10.134 10.017 14V21H3.017Z"></path></svg>
          </div>
          <p className="text-gray-700 leading-[1.6] text-xl font-medium mb-10 pl-2 relative z-10 italic">{paragraph}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-indigo-50/30 p-8 rounded-3xl border border-indigo-50/50">
            <h4 className="font-black text-indigo-900 mb-6 flex items-center gap-3 uppercase text-xs tracking-[0.2em]">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Core Knowledge
            </h4>
            {bullets.length > 0 ? (
              <ul className="space-y-4">
                {bullets.map((b, i) => (
                  <li key={i} className="text-[15px] text-gray-700 flex items-start gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-300 rounded-full flex-shrink-0"></div> 
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-400 italic">No specific takeaways extracted.</p>}
          </div>
          <div className="bg-purple-50/30 p-8 rounded-3xl border border-purple-50/50">
            <h4 className="font-black text-purple-900 mb-6 flex items-center gap-3 uppercase text-xs tracking-[0.2em]">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Intelligent Synthesis
            </h4>
            {insights.length > 0 ? (
              <ul className="space-y-4">
                {insights.map((ins, i) => (
                  <li key={i} className="text-[15px] text-gray-700 flex items-start gap-4">
                    <span className="text-purple-400 font-bold flex-shrink-0">✧</span> 
                    <span className="leading-snug font-medium">{ins}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-400 italic">No synthesis insights available.</p>}
          </div>
        </div>
      </div>

      {result.sources && result.sources.length > 0 && (
        <div className="mb-8 pt-8 border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Verification Intelligence</p>
          <div className="flex flex-wrap gap-3">
            {result.sources.map((s: any, i) => (
              s.web && (
                <a 
                  key={i} 
                  href={s.web.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group text-[11px] text-indigo-600 bg-white px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 truncate max-w-[280px] font-bold border border-indigo-100 shadow-sm"
                >
                  <span className="mr-2 text-indigo-300 group-hover:text-indigo-100">↗</span>
                  {s.web.title || s.web.uri}
                </a>
              )
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-12 pt-8 border-t border-gray-50">
        <button 
          onClick={handleCopy}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-3 py-4 px-6 rounded-2xl transition-all duration-300 text-sm font-black border-2 ${
            isCopied 
              ? 'bg-emerald-500 text-white border-emerald-500' 
              : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200'
          }`}
        >
          {isCopied ? "Wisdom Copied!" : "Copy Wisdom"}
        </button>
        <button 
          onClick={handleExportText}
          className="flex-1 min-w-[160px] flex items-center justify-center gap-3 py-4 px-6 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all text-sm font-black border-2 border-gray-100"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
