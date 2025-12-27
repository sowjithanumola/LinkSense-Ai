
import React, { useState } from 'react';
import { SummaryType, AppState, SummaryResult } from './types';
import { summarizeUrl } from './services/geminiService';
import SummaryCard from './components/SummaryCard';
import VoiceAssistant from './components/VoiceAssistant';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi'];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    urls: [''],
    summaries: [],
    isLoading: false,
    selectedSummaryType: SummaryType.SHORT,
    selectedLanguage: 'English'
  });

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...state.urls];
    newUrls[index] = value;
    setState(prev => ({ ...prev, urls: newUrls }));
  };

  const addUrlField = () => {
    setState(prev => ({ ...prev, urls: [...prev.urls, ''] }));
  };

  const removeUrlField = (index: number) => {
    const newUrls = state.urls.filter((_, i) => i !== index);
    setState(prev => ({ ...prev, urls: newUrls.length ? newUrls : [''] }));
  };

  const processSummaries = async () => {
    const validUrls = state.urls.filter(u => u.trim() !== '');
    if (validUrls.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true, summaries: [] }));

    try {
      const results: SummaryResult[] = [];
      for (const url of validUrls) {
        const result = await summarizeUrl(url, state.selectedSummaryType, state.selectedLanguage);
        results.push(result);
      }
      setState(prev => ({ ...prev, summaries: results, isLoading: false }));
    } catch (err) {
      console.error(err);
      alert("Something went wrong while summarizing. Please check your URLs.");
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">LinkSense <span className="text-indigo-600">AI</span></h1>
          </div>
          <div className="text-xs font-semibold text-gray-400 hidden sm:block">
            Powered by <span className="text-indigo-500">Mentor AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Instant Wisdom from Any <span className="text-indigo-600">URL.</span></h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            LinkSense AI is an AI-powered web platform that allows users to paste any public URL and instantly receive a clear, concise summary of the content. 
            The system uses <span className="font-semibold text-indigo-600">Mentor AI</span> as its intelligent engine to extract, analyze, and understand information from news articles, blogs, research, and documentation.
          </p>
        </div>

        {/* URL Inputs Area */}
        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/50 border border-indigo-50 mb-12">
          <div className="space-y-4 mb-8">
            {state.urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                  />
                  {state.urls.length > 1 && (
                    <button 
                      onClick={() => removeUrlField(index)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button 
              onClick={addUrlField}
              className="text-indigo-600 font-semibold text-sm flex items-center gap-1 hover:text-indigo-700 transition pl-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add another URL
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Summary Style</label>
              <select 
                value={state.selectedSummaryType}
                onChange={(e) => setState(prev => ({ ...prev, selectedSummaryType: e.target.value as SummaryType }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {Object.values(SummaryType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Language</label>
              <select 
                value={state.selectedLanguage}
                onChange={(e) => setState(prev => ({ ...prev, selectedLanguage: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={processSummaries}
            disabled={state.isLoading || state.urls.every(u => !u.trim())}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
          >
            {state.isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Mentor AI Processing...
              </span>
            ) : "Extract Wisdom"}
          </button>
        </section>

        {/* Results Section */}
        {state.summaries.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {state.summaries.map((res, i) => (
              <SummaryCard key={i} result={res} />
            ))}
            
            <VoiceAssistant context={JSON.stringify(state.summaries)} />
          </div>
        )}

        {/* Empty State */}
        {!state.isLoading && state.summaries.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 opacity-60">
             <div className="p-6 bg-white rounded-2xl border border-gray-100 text-center">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
               <h3 className="font-bold mb-2">Multi-Link Support</h3>
               <p className="text-sm text-gray-500">Paste one or many URLs to summarize everything at once.</p>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-gray-100 text-center">
               <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
               <h3 className="font-bold mb-2">Video Teasers</h3>
               <p className="text-sm text-gray-500">Generate cinematic video summaries powered by Veo.</p>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-gray-100 text-center">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
               <h3 className="font-bold mb-2">Voice Deep-Dive</h3>
               <p className="text-sm text-gray-500">Discuss results with the Mentor AI engine in real-time.</p>
             </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky CTA */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md md:hidden border-t border-gray-100">
         <button 
           onClick={processSummaries}
           disabled={state.isLoading}
           className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg"
         >
           {state.isLoading ? "Processing..." : "Summarize Links"}
         </button>
      </footer>
    </div>
  );
};

export default App;
