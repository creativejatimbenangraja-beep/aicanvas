import React, { useState } from 'react';
import { Copy, Check, Zap, RefreshCw, Sparkles, Volume2, RotateCcw } from 'lucide-react';

const API_KEY = ''; // Environment menyediakan API Key otomatis
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

const App = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(null);

  const systemPrompt = `
    Anda adalah Pakar Viral Konten yang membenci "template kaku".
    Tugas: Mengubah topik kusam menjadi Hook yang "Impossible to Skip" berdasarkan prinsip NotebookLM (Single Subject, Single Question).

    ATURAN ANTI-KAKU:
    1. HARAM menggunakan kata: "Inilah", "Cara", "Tips", "Rahasia", "Simak", "Tutorial", "Langkah-langkah".
    2. LANGSUNG KE KONFLIK: Jangan menyapa audiens. Jangan basa-basi. Langsung "tampar" mereka dengan fakta pahit atau anomali.
    3. NEGATIVE FRAMING: Orang lebih takut kehilangan daripada ingin mendapatkan. Fokus pada kesalahan fatal.
    4. SPECIFICITY: Gunakan angka ganjil atau detail yang sangat spesifik (bukan "banyak orang", tapi "97% pemula").
    5. PATTERN INTERRUPT: Gunakan pernyataan yang membuat otak mereka berhenti berproses sejenak karena bingung atau kaget.

    STRUKTUR OUTPUT (Wajib 5 Kategori):
    - Killer A (The Fear): Fokus pada kehancuran/kegagalan. (Contoh: "Kontenmu mati karena 3 detik pertama ini.")
    - Killer B (The Proof): Bukti nyata yang tidak masuk akal. (Contoh: "Modal 0 rupiah, tapi dapat 10 juta dalam semalam.")
    - Killer C (The Outcome): Hasil instan tanpa usaha yang biasa dilakukan. (Contoh: "Perut rata tanpa harus angkat beban tiap pagi.")
    - WTF D (The Contrarian): Melawan arus/opini populer. (Contoh: "Berhenti konsumsi vitamin C kalau mau kulit cerah.")
    - WTF E (The Secret/Illegal): Sudut pandang "Curang" atau "Hidden Path". (Contoh: "Cara curang masuk FYP yang nggak bakal dibocorin kreator besar.")

    VALIDASI TEKNIS:
    - text_hook: 6-10 kata saja. Padat. Gunakan CAPS LOCK pada kata kunci yang memicu emosi (MARAH, RUGI, HANCUR, GAGAL, DISALIP).
    - spoken_hook: Bahasa santai, seperti bicara ke teman akrab, penuh penekanan (intonasi tinggi).
    - desc: Psikologi di balik hook tersebut (misal: "Loss Aversion" atau "Curiosity Gap").

    FORMAT JSON MURNI:
    {
      "hooks": [
        { "category": "Killer Hook", "type": "Fear", "text_hook": "...", "spoken_hook": "...", "desc": "..." },
        { "category": "Killer Hook", "type": "Proof", "text_hook": "...", "spoken_hook": "...", "desc": "..." },
        { "category": "Killer Hook", "type": "Outcome", "text_hook": "...", "spoken_hook": "...", "desc": "..." },
        { "category": "WTF Hook", "type": "Contrarian", "text_hook": "...", "spoken_hook": "...", "desc": "..." },
        { "category": "WTF Hook", "type": "Secret", "text_hook": "...", "spoken_hook": "...", "desc": "..." }
      ]
    }
  `;

  const generateHooks = async (targetIndex = null) => {
    if (!input.trim()) return;

    if (targetIndex !== null) {
      setIsRegenerating(targetIndex);
    } else {
      setIsLoading(true);
      setResult(null);
    }
    setError(null);

    try {
      let promptText = `Topik: "${input}". Buat hook yang kasar, berani, dan langsung menusuk rasa penasaran. Jangan kaku!`;
      if (targetIndex !== null && result) {
        const currentType = result.hooks[targetIndex].type;
        promptText = `Topik: "${input}". Buat ulang 1 hook tipe "${currentType}" yang LEBIH PROVOKATIF dan menantang.`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 1, responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) throw new Error('Gagal terhubung ke AI.');
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);

      if (targetIndex !== null) {
        setResult((prev) => {
          const updatedHooks = [...prev.hooks];
          updatedHooks[targetIndex] = parsed.hooks[0];
          return { ...prev, hooks: updatedHooks };
        });
      } else {
        setResult(parsed);
      }
    } catch {
      setError('Gagal memproses hook. Coba ketik ide lain.');
    } finally {
      setIsLoading(false);
      setIsRegenerating(null);
    }
  };

  const copyToClipboard = (text, id) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/10">
      <div className="mx-auto max-w-2xl p-5 pt-12 md:pt-20">
        <div className="mb-10 text-center">
          <div className="relative mb-4 inline-block">
            <div className="absolute inset-0 animate-pulse bg-yellow-400 opacity-20 blur-[40px]" />
            <Zap size={32} className="relative animate-bounce fill-yellow-400 text-yellow-400" style={{ animationDuration: '5s' }} />
          </div>
          <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-yellow-400 italic md:text-5xl">Hook Level Up!</h1>
          <p className="px-4 text-base font-normal leading-snug tracking-tight text-white opacity-90 md:text-lg">
            Ubah Normal Hook-mu jadi amunisi konten yang bikin jempol audiens berhenti scrolling.
          </p>
        </div>

        <div className="mb-14">
          <div className="rounded-3xl border border-white/5 bg-[#0e0e0e] p-1.5 shadow-2xl transition-all focus-within:border-white/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis Normal Hook-mu disini..."
              className="min-h-[100px] w-full resize-none bg-transparent p-5 text-lg font-medium placeholder:text-gray-800 focus:outline-none"
            />
            <div className="flex justify-end p-2">
              <button
                onClick={() => generateHooks()}
                disabled={isLoading || !input.trim()}
                className="flex items-center gap-2 rounded-2xl bg-white px-6 py-2.5 text-[11px] font-black uppercase text-black transition-all hover:bg-gray-200 active:scale-95 disabled:opacity-20"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} className="fill-current" />}
                Level-Up!
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-20 pb-40">
          {error && <div className="rounded-xl bg-red-400/10 p-4 text-center text-sm font-bold text-red-400">{error}</div>}

          {result?.hooks.map((hook, idx) => {
            const isWTF = hook.category.includes('WTF');
            const isProcessing = isRegenerating === idx;

            return (
              <div
                key={idx}
                className={`relative transition-all duration-500 ${
                  isProcessing ? 'scale-95 opacity-30 blur-sm' : 'animate-in slide-in-from-bottom-6 fade-in opacity-100'
                }`}
              >
                <div className="mb-4">
                  <span
                    className={`rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                      isWTF ? 'border-orange-500/50 text-orange-500' : 'border-yellow-500/50 text-yellow-500'
                    }`}
                  >
                    {hook.category} — {hook.type}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-6">
                  <h2 className="flex-1 text-2xl font-black uppercase italic leading-[1.1] tracking-tighter text-white md:text-4xl">{hook.text_hook}</h2>
                  <div className="pt-1 flex flex-col gap-3">
                    <button
                      onClick={() => copyToClipboard(hook.text_hook, idx)}
                      className={`p-2 transition-all ${copiedId === idx ? 'scale-125 text-green-500' : 'text-gray-700 hover:text-white'}`}
                    >
                      {copiedId === idx ? <Check size={24} /> : <Copy size={24} />}
                    </button>
                    <button
                      onClick={() => generateHooks(idx)}
                      disabled={isRegenerating !== null}
                      className="p-2 text-gray-700 transition-all duration-700 hover:text-white active:rotate-180"
                    >
                      <RotateCcw size={22} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-3">
                  <div className="shrink-0 pt-1 text-gray-400">
                    <Volume2 size={20} />
                  </div>
                  <p className="flex-1 border-b border-white/5 pb-4 text-[15px] font-medium italic leading-relaxed text-gray-200 md:text-[17px]">
                    "{hook.spoken_hook}"
                  </p>
                </div>

                <div className="mt-3 ml-1.5 flex items-center gap-2.5 px-1">
                  <p className="text-[11px] font-bold uppercase italic leading-tight tracking-wider text-gray-500 opacity-70 md:text-[12px]">
                    Trigger: {hook.desc}
                  </p>
                </div>
              </div>
            );
          })}

          {isLoading &&
            [1, 2].map((i) => (
              <div key={i} className="animate-pulse space-y-6">
                <div className="h-4 w-32 rounded-md bg-white/5" />
                <div className="h-20 w-full rounded-2xl bg-white/10" />
                <div className="h-10 w-3/4 rounded-xl bg-white/5" />
              </div>
            ))}
        </div>

        {!result && !isLoading && (
          <div className="py-20 text-center opacity-10">
            <Sparkles size={40} className="mx-auto" />
            <p className="mt-4 text-sm font-bold uppercase tracking-widest">Input topik di atas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
