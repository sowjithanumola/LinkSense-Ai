
import React, { useState } from 'react';
import { SummaryResult } from '../types';
import { generateVideoTeaser } from '../services/geminiService';

interface SummaryCardProps {
  result: SummaryResult;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ result }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const formatTextForClipboard = () => {
    return `
LinkSense AI Wisdom
-------------------
Title: ${result.title}
URL: ${result.url}
Summary: ${result.paragraph}

Key Takeaways:
${result.bullets.map(b => `- ${b}`).join('\n')}

Mentor AI Insights:
${result.insights.map(i => `- ${i}`).join('\n')}
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
    a.download = `linksense_${result.title.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    try {
      const url = await generateVideoTeaser(result.paragraph);
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate video. Ensure you have selected an API key from a paid project.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
           <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Extracted content</p>
           <h2 className="text-2xl font-extrabold text-gray-800 leading-tight pr-4">{result.title}</h2>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">
            {result.language}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 leading-relaxed text-lg mb-6 italic">"{result.paragraph}"</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              Key Takeaways
            </h4>
            <ul className="space-y-3">
              {result.bullets.map((b, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span> 
                  <span className="leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              Mentor AI Insights
            </h4>
            <ul className="space-y-3">
              {result.insights.map((ins, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-3">
                  <span className="text-indigo-500 font-bold">✧</span> 
                  <span className="leading-snug">{ins}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {result.sources && result.sources.length > 0 && (
        <div className="mb-6 pt-6 border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Verification Sources</p>
          <div className="flex flex-wrap gap-2">
            {result.sources.map((s: any, i) => (
              s.web && (
                <a 
                  key={i} 
                  href={s.web.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition truncate max-w-[240px] font-medium border border-indigo-100/50"
                >
                  {s.web.title || s.web.uri}
                </a>
              )
            ))}
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-black">
          <video src={videoUrl} controls className="w-full aspect-video" />
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-8">
        <button 
          onClick={handleCopy}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition text-sm font-bold border border-indigo-200"
        >
          {isCopied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              Copy Wisdom
            </>
          )}
        </button>
        <button 
          onClick={handleExportText}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-bold border border-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download
        </button>
        <button 
          onClick={handleGenerateVideo}
          disabled={isGeneratingVideo}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-bold disabled:opacity-50 shadow-lg shadow-indigo-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          {isGeneratingVideo ? 'Visualizing...' : 'Video Teaser'}
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
