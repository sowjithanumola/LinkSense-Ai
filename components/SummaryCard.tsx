
import React, { useState } from 'react';
import { SummaryResult } from '../types';
import { generateVideoTeaser } from '../services/mentorService';

interface SummaryCardProps {
  result: SummaryResult;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ result }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const formatTextForClipboard = () => {
    return `
LinkSense AI | Content Wisdom
------------------------------
Title: ${result.title}
Source: ${result.url}

Summary:
${result.paragraph}

Key Takeaways:
${result.bullets.map(b => `• ${b}`).join('\n')}

Mentor AI Intelligent Insights:
${result.insights.map(i => `✦ ${i}`).join('\n')}

Language: ${result.language}
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
    a.download = `linksense_${result.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    a.click();
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    try {
      const url = await generateVideoTeaser(result.paragraph);
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate video. Ensure you have selected a valid API key from a paid GCP project.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/30 border border-gray-100 hover:border-indigo-200 transition-all duration-500 animate-in fade-in zoom-in-95">
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div className="max-w-2xl">
           <div className="flex items-center gap-3 mb-3">
             <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
               {result.language}
             </span>
             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified by Mentor AI</p>
           </div>
           <h2 className="text-3xl font-black text-gray-900 leading-[1.1] tracking-tight mb-2">{result.title}</h2>
           <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-600 truncate block max-w-sm transition-colors font-medium">
             {result.url}
           </a>
        </div>
        <div className="flex flex-col items-end">
           <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100">
             <p className="text-[10px] font-black uppercase tracking-tighter opacity-70 leading-none mb-1 text-center">Efficiency Gain</p>
             <p className="text-xl font-black text-center">+{Math.round(((result.readingTimeOriginal - result.readingTimeSummary) / result.readingTimeOriginal) * 100)}%</p>
           </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="relative">
          <div className="absolute -left-6 top-0 text-indigo-100 select-none">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.895 14.912 16 16.017 16H19.017V14C19.017 11.239 16.778 9 14.017 9V7C17.883 7 21.017 10.134 21.017 14V21H14.017ZM3.017 21L3.017 18C3.017 16.895 3.912 16 5.017 16H8.017V14C8.017 11.239 5.778 9 3.017 9V7C6.883 7 10.017 10.134 10.017 14V21H3.017Z"></path></svg>
          </div>
          <p className="text-gray-700 leading-[1.6] text-xl font-medium mb-10 pl-2 relative z-10 italic">{result.paragraph}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-indigo-50/30 p-8 rounded-3xl border border-indigo-50/50">
            <h4 className="font-black text-indigo-900 mb-6 flex items-center gap-3 uppercase text-xs tracking-[0.2em]">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              Core Knowledge
            </h4>
            <ul className="space-y-4">
              {result.bullets.map((b, i) => (
                <li key={i} className="text-[15px] text-gray-700 flex items-start gap-4">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-300 rounded-full flex-shrink-0"></div> 
                  <span className="leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-purple-50/30 p-8 rounded-3xl border border-purple-50/50">
            <h4 className="font-black text-purple-900 mb-6 flex items-center gap-3 uppercase text-xs tracking-[0.2em]">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              Intelligent Synthesis
            </h4>
            <ul className="space-y-4">
              {result.insights.map((ins, i) => (
                <li key={i} className="text-[15px] text-gray-700 flex items-start gap-4">
                  <span className="text-purple-400 font-bold flex-shrink-0">✧</span> 
                  <span className="leading-snug font-medium">{ins}</span>
                </li>
              ))}
            </ul>
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

      {videoUrl && (
        <div className="mt-8 rounded-3xl overflow-hidden border-8 border-white shadow-2xl bg-black animate-in fade-in slide-in-from-top-4 duration-500">
          <video src={videoUrl} controls className="w-full aspect-video" />
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
          {isCopied ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              Wisdom Copied!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              Copy Wisdom
            </>
          )}
        </button>
        <button 
          onClick={handleExportText}
          className="flex-1 min-w-[160px] flex items-center justify-center gap-3 py-4 px-6 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all text-sm font-black border-2 border-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download
        </button>
        <button 
          onClick={handleGenerateVideo}
          disabled={isGeneratingVideo}
          className="flex-[1.5] min-w-[200px] flex items-center justify-center gap-3 py-4 px-8 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all text-sm font-black disabled:opacity-50 shadow-xl shadow-indigo-200 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          {isGeneratingVideo ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing Video...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Generate Video Teaser
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
