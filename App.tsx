
import React, { useState } from 'react';
import { SummaryType, AppState, SummaryResult } from './types';
import { summarizeUrl } from './services/mentorService';
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
        // Ensure URL has a protocol
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        const result = await summarizeUrl(fullUrl, state.selectedSummaryType, state.selectedLanguage);
        results.push(result);
      }
      setState(prev => ({ ...prev, summaries: results, isLoading: false }));
    } catch (err: any) {
      console.error("LinkSense AI Application Error:", err);
      const errorMessage = err?.message || "Something went wrong while summarizing.";
      alert(`${errorMessage}\n\nPlease check your URLs and try again.`);
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
              LinkSense AI is an AI-powered web platform that allows users to paste any public URL and instantly receive a clear, concise summary of the content. 
            </p>
            <p className="text-md text-gray-500 leading-relaxed">
              The system uses <span className="font-semibold text-indigo-600">Mentor AI</span> as its intelligent engine to extract, analyze, and understand information from news, blogs, and documentation.
            </p>
          </div>
        </div>

        <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-indigo-100/40 border border-indigo-50/50 mb-12">
          <div className="space-y-5 mb-8">
            {state.urls.map((url, index) => (
              <div key={index} className="flex gap-2 group">
                <div className="relative flex-1">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L7.04 11.39m5.657 5.657l.707-.707m-1.414-1.414l.707-.707M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.102"></path></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Paste a URL (e.g. nytimes.com/article)..."
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    className="w-full pl-14 pr-12 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-400 outline-none transition-all text-gray-700 font-medium"
                  />
                  {state.urls.length > 1 && (
                    <button 
                      onClick={() => removeUrlField(index)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button 
              onClick={addUrlField}
              className="text-indigo-600 font-bold text-sm flex items-center gap-2 hover:text-indigo-700 transition-all pl-2 px-3 py-2 rounded-lg hover:bg-indigo-50 w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add another link
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Summary Format</label>
              <select 
                value={state.selectedSummaryType}
                onChange={(e) => setState(prev => ({ ...prev, selectedSummaryType: e.target.value as SummaryType }))}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-gray-700"
              >
                {Object.values(SummaryType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Output Language</label>
              <select 
                value={state.selectedLanguage}
                onChange={(e) => setState(prev => ({ ...prev, selectedLanguage: e.target.value }))}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-gray-700"
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
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"
          >
            {state.isLoading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Mentor AI is analyzing content...
              </>
            ) : "Extract Wisdom"}
          </button>
        </section>

        {state.summaries.length > 0 && (
          <div className="space-y-10">
            {state.summaries.map((res, i) => (
              <SummaryCard key={i} result={res} />
            ))}
            <VoiceAssistant context={JSON.stringify(state.summaries)} />
          </div>
        )}

        {!state.isLoading && state.summaries.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
             <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center">
               <h3 className="font-bold text-gray-800 mb-3 text-lg">Batch Processing</h3>
               <p className="text-sm text-gray-500">Summarize multiple links simultaneously.</p>
             </div>
             <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center">
               <h3 className="font-bold text-gray-800 mb-3 text-lg">Visual Summaries</h3>
               <p className="text-sm text-gray-500">Convert insights into video teasers.</p>
             </div>
             <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center">
               <h3 className="font-bold text-gray-800 mb-3 text-lg">Voice Dialogue</h3>
               <p className="text-sm text-gray-500">Discuss results with Mentor AI voice engine.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
