
import React, { useState } from 'react';
import { SummaryType, AppState, SummaryResult } from './types';
import { summarizeUrl } from './services/mentorService';
import SummaryCard from './components/SummaryCard';
import VoiceAssistant from './components/VoiceAssistant';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Arabic', 'Portuguese'];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    urls: [''],
    summaries: [],
    isLoading: false,
    selectedSummaryType: SummaryType.SHORT,
    selectedLanguage: 'English'
  });
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...state.urls];
    newUrls[index] = value;
    setState(prev => ({ ...prev, urls: newUrls }));
    if (errorStatus) setErrorStatus(null);
  };

  const addUrlField = () => {
    setState(prev => ({ ...prev, urls: [...prev.urls, ''] }));
  };

  const removeUrlField = (index: number) => {
    const newUrls = state.urls.filter((_, i) => i !== index);
    setState(prev => ({ ...prev, urls: newUrls.length ? newUrls : [''] }));
  };

  const handleSwitchKey = async () => {
    try {
      await (window as any).aistudio?.openSelectKey();
      setErrorStatus(null);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const processSummaries = async () => {
    const validUrls = state.urls.filter(u => u.trim() !== '');
    if (validUrls.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true, summaries: [] }));
    setErrorStatus(null);

    try {
      const results: SummaryResult[] = [];
      for (const url of validUrls) {
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        const result = await summarizeUrl(fullUrl, state.selectedSummaryType, state.selectedLanguage);
        results.push(result);
      }
      setState(prev => ({ ...prev, summaries: results, isLoading: false }));
    } catch (err: any) {
      console.error("LinkSense AI Application Error:", err);
      // Clean up error messages for better UI
      const msg = err.message || "An unexpected error occurred.";
      setErrorStatus(msg);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-indigo-100">
      <header className="sticky top-0 z-50 glass border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">L</div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">LinkSense <span className="text-indigo-600">AI</span></h1>
          </div>
          <div className="text-xs font-bold text-gray-400 hidden sm:block uppercase tracking-widest">
            Powered by <span className="text-indigo-600">Mentor AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
            Universal Intelligence <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">for the Modern Web.</span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              LinkSense AI instantly transforms any URL into actionable wisdom using high-performance machine learning.
            </p>
          </div>
        </div>

        {errorStatus && (
          <div className="mb-10 p-8 bg-white border-2 border-red-100 rounded-[2rem] shadow-xl shadow-red-50 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex gap-5 items-start">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 flex-shrink-0 border border-red-100">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <h4 className="font-black text-red-900 mb-2 uppercase text-sm tracking-[0.2em]">Service Limitation</h4>
                <p className="text-gray-600 text-[15px] leading-relaxed max-w-lg">
                  {errorStatus.includes('RATE_LIMIT') 
                    ? "The current API key has hit its free-tier usage limit. To get unlimited access and faster results, please connect a Paid API Project."
                    : errorStatus}
                </p>
              </div>
            </div>
            <button 
              onClick={handleSwitchKey}
              className="px-8 py-4 bg-red-600 text-white text-sm font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95 whitespace-nowrap"
            >
              Switch API Project
            </button>
          </div>
        )}

        <section className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-indigo-100/40 border border-indigo-50/50 mb-12">
          <div className="space-y-6 mb-10">
            {state.urls.map((url, index) => (
              <div key={index} className="flex gap-2 group">
                <div className="relative flex-1">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L7.04 11.39m5.657 5.657l.707-.707m-1.414-1.414l.707-.707M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.102"></path></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter URL to extract wisdom..."
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    className="w-full pl-16 pr-14 py-6 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/20 outline-none transition-all text-gray-700 font-bold text-lg placeholder:text-gray-300"
                  />
                  {state.urls.length > 1 && (
                    <button 
                      onClick={() => removeUrlField(index)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 p-2 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button 
              onClick={addUrlField}
              className="text-indigo-600 font-black text-sm flex items-center gap-2 hover:bg-indigo-50 w-fit px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
              Add Multiple Links
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Summary Density</label>
              <select 
                value={state.selectedSummaryType}
                onChange={(e) => setState(prev => ({ ...prev, selectedSummaryType: e.target.value as SummaryType }))}
                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none font-black text-gray-700 appearance-none"
              >
                {Object.values(SummaryType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Global Language</label>
              <select 
                value={state.selectedLanguage}
                onChange={(e) => setState(prev => ({ ...prev, selectedLanguage: e.target.value }))}
                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none font-black text-gray-700 appearance-none"
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
            className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black text-2xl hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-indigo-200 flex items-center justify-center gap-4"
          >
            {state.isLoading ? (
              <>
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Mentor AI is Thinking...
              </>
            ) : "Start Analysis"}
          </button>
        </section>

        {state.summaries.length > 0 && (
          <div className="space-y-12">
            {state.summaries.map((res, i) => (
              <SummaryCard key={i} result={res} />
            ))}
            <VoiceAssistant context={JSON.stringify(state.summaries)} />
          </div>
        )}

        {!state.isLoading && state.summaries.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-24 opacity-60 max-w-2xl mx-auto">
             <div className="p-10 bg-white rounded-[2rem] border border-gray-100 text-center shadow-sm">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               </div>
               <h3 className="font-black text-gray-800 mb-2 uppercase text-xs tracking-widest">Parallel Processing</h3>
               <p className="text-sm text-gray-500 font-medium">Analyze clusters of sources simultaneously.</p>
             </div>
             <div className="p-10 bg-white rounded-[2rem] border border-gray-100 text-center shadow-sm">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
               </div>
               <h3 className="font-black text-gray-800 mb-2 uppercase text-xs tracking-widest">Native Voice</h3>
               <p className="text-sm text-gray-500 font-medium">Real-time low-latency discussion with the AI core.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
