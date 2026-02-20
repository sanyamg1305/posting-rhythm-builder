
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { generateStrategy } from './services/geminiService';
import { AppState, PostingStrategy, FounderLifestyle, Tone, ContentStrength } from './types';
import { LIFESTYLE_OPTIONS, TONE_OPTIONS, STRENGTH_OPTIONS, DEFAULT_APP_STATE } from './constants';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dmpllxjtcahobgkipkkr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xDxY4hl0MVWgB6xqayaIMQ_34naEIF7';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type FlowStep = 'input' | 'lead' | 'results';

const App: React.FC = () => {
  const [formData, setFormData] = useState<AppState>(DEFAULT_APP_STATE);
  const [leadData, setLeadData] = useState({ name: '', email: '', contact: '' });
  const [strategy, setStrategy] = useState<PostingStrategy | null>(null);
  const [step, setStep] = useState<FlowStep>('input');
  const [loading, setLoading] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStrength = (strength: ContentStrength) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.includes(strength)
        ? prev.strengths.filter(s => s !== strength)
        : [...prev.strengths, strength]
    }));
  };

  const isFormValid = formData.lifestyle && formData.icp && formData.tone && formData.strengths.length > 0;

  const handleBuildInitial = async () => {
    if (!isFormValid) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateStrategy(formData);
      setStrategy(result);
      setStep('lead');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      if (err.message === "MISSING_API_KEY" || err.message?.includes("API key")) {
        setError("Configuration Error: API Key is missing. Please add VITE_GEMINI_API_KEY to your Netlify Environment Variables.");
      } else {
        // Show the specific error message from the API (e.g. "Quota exceeded", "API key not valid")
        setError(`Failed to build strategy: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name || !leadData.email || !leadData.contact) {
      setError("All fields are required to unlock your strategy.");
      return;
    }

    setSavingLead(true);
    setError(null);
    try {
      // Save to Supabase
      const { error: dbError } = await supabase
        .from('leads')
        .insert([
          {
            name: leadData.name,
            email: leadData.email,
            contact: leadData.contact,
            icp: formData.icp,
            lifestyle: formData.lifestyle,
            tone: formData.tone,
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      setStep('results');
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error("Supabase Error:", err);
      // Alert user but allow them to proceed
      setError("Note: Could not save your details to the database (Check console). Displaying strategy anyway.");
      setStep('results');
    } finally {
      setSavingLead(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-[#FFC947] selection:text-black">
      {/* Header */}
      <header className="relative pt-16 pb-12 px-6 text-center">
        <img src="/logo.png" alt="Myntmore Logo" className="absolute top-6 left-6 w-32 md:w-40" />
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase leading-none">
          Myntmore <span className="accent-text">Rhythm</span><br />Builder
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
          Deterministic content strategy for founders and high-performance B2B operators.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        {/* Step 1: Input Panel */}
        {step === 'input' && (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-500">
            <div className="absolute top-0 left-0 w-full h-1 accent-bg opacity-50"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Founder Lifestyle</label>
                <select
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFC947] outline-none transition-colors appearance-none cursor-pointer"
                  value={formData.lifestyle || ""}
                  onChange={(e) => setFormData({ ...formData, lifestyle: e.target.value as FounderLifestyle })}
                >
                  <option value="" disabled>Select lifestyle...</option>
                  {LIFESTYLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Preferred Tone</label>
                <select
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFC947] outline-none transition-colors appearance-none cursor-pointer"
                  value={formData.tone || ""}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as Tone })}
                >
                  <option value="" disabled>Select tone...</option>
                  {TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Ideal Customer Profile (ICP)</label>
                <input
                  type="text"
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-4 text-white focus:border-[#FFC947] outline-none transition-colors placeholder:text-gray-700"
                  placeholder="e.g. Sales Leaders at Series B SaaS companies"
                  value={formData.icp}
                  onChange={(e) => setFormData({ ...formData, icp: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Content Strengths</label>
                <div className="flex flex-wrap gap-2">
                  {STRENGTH_OPTIONS.map(strength => (
                    <button
                      key={strength}
                      onClick={() => toggleStrength(strength)}
                      className={`px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300 ${formData.strengths.includes(strength)
                        ? 'accent-bg text-black border-[#FFC947] shadow-[0_0_15px_rgba(255,201,71,0.2)]'
                        : 'bg-black text-white border-white/10 hover:border-white/30'
                        }`}
                    >
                      {strength}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleBuildInitial}
              disabled={loading || !isFormValid}
              className={`w-full py-5 rounded-xl font-bold text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${loading || !isFormValid
                ? 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-50'
                : 'accent-bg text-black hover:opacity-90 active:scale-[0.99] shadow-lg hover:shadow-[#FFC947]/10'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Generating Strategy...
                </>
              ) : (
                'Build My Rhythm'
              )}
            </button>
            {error && <p className="mt-4 text-red-500 text-center text-sm font-medium">{error}</p>}
          </div>
        )}

        {/* Step 2: Lead Form */}
        {step === 'lead' && (
          <div className="max-w-lg mx-auto bg-[#0A0A0A] border border-[#FFC947] rounded-2xl p-8 md:p-12 shadow-[0_0_50px_rgba(255,201,71,0.1)] animate-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-black text-center mb-2 uppercase tracking-tight">Unlock Your Strategy</h2>
            <p className="text-gray-400 text-center mb-8 text-sm leading-relaxed">
              Your posting rhythm is ready. Enter your details to view and download your full operating system.
            </p>

            <form onSubmit={handleLeadSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FFC947] outline-none transition-colors"
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Business Email</label>
                <input
                  required
                  type="email"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FFC947] outline-none transition-colors"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact Number</label>
                <input
                  required
                  type="tel"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FFC947] outline-none transition-colors"
                  value={leadData.contact}
                  onChange={(e) => setLeadData({ ...leadData, contact: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={savingLead}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${savingLead
                  ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                  : 'accent-bg text-black hover:opacity-90 active:scale-[0.98]'
                  }`}
              >
                {savingLead ? 'Unlocking...' : 'View My Strategy'}
              </button>
              {error && <p className="mt-4 text-red-500 text-center text-xs">{error}</p>}
            </form>
          </div>
        )}

        {/* Step 3: Results Section */}
        {step === 'results' && strategy && (
          <div id="results-section" className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col">
                <h3 className="text-[#FFC947] text-[10px] font-bold uppercase tracking-[0.25em] mb-6">Best Posting Days</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">{strategy.bestPostingDays.explanation}</p>
                <div className="space-y-4 mb-10">
                  {strategy.bestPostingDays.days.map(day => (
                    <div key={day} className="flex items-center gap-4 text-2xl font-bold">
                      <div className="w-2.5 h-2.5 accent-bg rounded-full shadow-[0_0_8px_rgba(255,201,71,0.5)]"></div>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="pt-8 border-t border-white/10 mt-auto">
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Best Time Window</p>
                  <p className="text-2xl font-black tracking-tight">{strategy.bestPostingDays.timeWindow}</p>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col">
                <h3 className="text-[#FFC947] text-[10px] font-bold uppercase tracking-[0.25em] mb-8">Topic Cadence</h3>
                <div className="space-y-8 mb-10 flex-grow">
                  {strategy.topicCadence.schedule.map(item => (
                    <div key={item.day} className="grid grid-cols-[120px_1fr] gap-4 items-start border-b border-white/5 pb-4 last:border-0">
                      <span className="text-xl font-black tracking-tight">{item.day}</span>
                      <span className="text-gray-300 text-sm leading-snug pt-1 font-medium">{item.type}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/5">
                  <p className="text-sm text-gray-500 leading-relaxed font-light">
                    {strategy.topicCadence.psychology}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-12">
              <h3 className="text-[#FFC947] text-[10px] font-bold uppercase tracking-[0.25em] mb-10">Weekly Posting System</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategy.weeklySystem.routine.map(item => (
                  <div key={item.day} className="bg-black border border-white/5 p-6 rounded-xl group hover:border-[#FFC947]/30 transition-colors">
                    <p className="text-[#FFC947] text-xs font-bold uppercase tracking-widest mb-3 group-hover:translate-x-1 transition-transform">{item.day}</p>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-12">
              <h3 className="text-[#FFC947] text-[10px] font-bold uppercase tracking-[0.25em] mb-10">High Probability Post Ideas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {strategy.postIdeas.map((idea, idx) => (
                  <div key={idx} className="group border-l-2 border-white/10 pl-8 py-1 hover:border-[#FFC947] transition-all duration-300">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 group-hover:text-[#FFC947] transition-colors">
                      {idea.category}
                    </p>
                    <p className="text-lg leading-snug font-semibold text-white/90 group-hover:text-white transition-colors">
                      {idea.idea}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-10">
                <h3 className="text-[#FFC947] text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-center">Scroll-Stopping Hooks</h3>
                <div className="space-y-8">
                  {strategy.hooks.map((hook, idx) => (
                    <div key={idx} className="flex gap-6 group">
                      <span className="text-gray-800 font-black text-xl group-hover:text-gray-600 transition-colors">{String(idx + 1).padStart(2, '0')}</span>
                      <p className="text-gray-300 text-[15px] leading-relaxed pt-1">"{hook}"</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-10">
                <h3 className="text-[#FFC947] text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-center">Low-Friction CTAs</h3>
                <div className="space-y-8">
                  {strategy.ctas.map((cta, idx) => (
                    <div key={idx} className="flex gap-6 group">
                      <span className="text-gray-800 font-black text-xl group-hover:text-gray-600 transition-colors">{String(idx + 1).padStart(2, '0')}</span>
                      <p className="text-gray-300 text-[15px] leading-relaxed pt-1 font-medium">{cta}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-12 text-center shadow-xl">
              <h3 className="text-2xl font-bold mb-8 uppercase tracking-tight">Ready to execute your new rhythm?</h3>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-4 px-10 py-5 border-2 border-white/20 text-white font-bold rounded-full hover:bg-white hover:text-black hover:border-white transition-all active:scale-[0.98] uppercase text-sm tracking-widest"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Full Operating Pack
              </button>
            </div>

            <div className="relative group overflow-hidden bg-black border-2 border-[#FFC947] rounded-2xl p-12 md:p-20 text-center shadow-[0_0_60px_rgba(255,201,71,0.08)]">
              <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <svg className="w-64 h-64 text-[#FFC947]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" /></svg>
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10 leading-tight uppercase tracking-tighter">
                Want us to execute your content engine?
              </h2>
              <p className="text-gray-400 mb-12 max-w-2xl mx-auto relative z-10 text-lg font-light leading-relaxed">
                Myntmore handles the complete content cycle: Strategy, Copywriting, and Daily Distribution for elite B2B founders.
              </p>
              <a
                href="https://calendly.com/founder-myntmore/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block accent-bg text-black font-black px-12 py-5 rounded-full text-lg uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(255,201,71,0.4)] transition-all active:scale-[0.98] relative z-10"
              >
                Book A Call
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-32 pt-16 border-t border-white/5 px-6 text-center text-gray-700 text-[10px] font-bold tracking-[0.4em] uppercase">
        Myntmore &bull; Built for High-Performance Operators &bull; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
