import React, { useState } from 'react';
import { 
  Music2, 
  Volume2, 
  Image as ImageIcon, 
  Mic, 
  Play, 
  Pause, 
  Download, 
  RefreshCw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const MediaStudio: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'tts' | 'image' | 'music' | 'transcribe'>('tts');

  // TTS State
  const [ttsText, setTtsText] = useState('Alex: Welcome to Bonsai WebUI.Sam: Running a 27B model in an 8GB laptop RAM envelope with zero compromise.');
  const [ttsVoice, setTtsVoice] = useState('Kore');
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  // Image State
  const [imagePrompt, setImagePrompt] = useState('A sleek minimalist cybernetic laptop running a glowing binary neural network labeled Bonsai 27B, 8k resolution, cinematic lighting');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Music State
  const [musicPrompt, setMusicPrompt] = useState('A futuristic ambient synthwave track with gentle arpeggiators and deep sub-bass, 30s');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTogglePlay = (url: string) => {
    if (isPlayingAudio && audioEl) {
      audioEl.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play();
      setAudioEl(audio);
      setIsPlayingAudio(true);
    }
  };

  const handleGenerateTts = async () => {
    if (!ttsText.trim() || isGeneratingTts) return;
    setIsGeneratingTts(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText, voice: ttsVoice }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        setTtsAudioUrl(data.audioUrl);
        setStatusMessage({ type: 'success', text: 'TTS speech generated successfully via gemini-3.8-flash-tts' });
      } else {
        throw new Error(data.error || 'Failed to generate speech');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio, imageSize }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setStatusMessage({ type: 'success', text: `Image generated successfully (${aspectRatio}) via gemini-3.1-flash-image` });
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() || isGeneratingMusic) return;
    setIsGeneratingMusic(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        setMusicAudioUrl(data.audioUrl);
        setStatusMessage({ type: 'success', text: 'Music clip generated successfully via lyria-3-clip-preview' });
      } else {
        throw new Error(data.error || 'Failed to generate music');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Multimedia Generative Studio</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
              Gemini 3 & Lyria Native
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            High-fidelity generative tools connected directly to the Bonsai WebUI backend. Generate speech narration, studio-grade imagery, and music clips.
          </p>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tool Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTool('tts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTool === 'tts'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speech (TTS)</span>
          </button>

          <button
            onClick={() => setActiveTool('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTool === 'image'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image Generation</span>
          </button>

          <button
            onClick={() => setActiveTool('music')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTool === 'music'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Music (Lyria)</span>
          </button>
        </div>

        {/* TTS Panel */}
        {activeTool === 'tts' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Speech Persona & Synthesis (gemini-3.8-flash-tts)
              </span>
              <span className="text-[11px] font-mono text-emerald-400">24kHz WAV Audio</span>
            </div>

            <textarea
              rows={3}
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Enter text to synthesize into speech..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Prebuilt Voice</label>
                <select
                  value={ttsVoice}
                  onChange={(e) => setTtsVoice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                >
                  <option value="Kore">Kore (Articulate, Balanced)</option>
                  <option value="Puck">Puck (Energetic, Clear)</option>
                  <option value="Zephyr">Zephyr (Warm, Dynamic)</option>
                  <option value="Fenrir">Fenrir (Authoritative, Deep)</option>
                  <option value="Charon">Charon (Calm, Grounded)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateTts}
                  disabled={isGeneratingTts || !ttsText.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingTts ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Audio...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Synthesize Speech</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {ttsAudioUrl && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Synthesized WAV Audio Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePlay(ttsAudioUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlayingAudio ? 'Pause' : 'Play Audio'}</span>
                  </button>
                  <a
                    href={ttsAudioUrl}
                    download="bonsai-speech.wav"
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Download WAV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Panel */}
        {activeTool === 'image' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Image Generation (gemini-3.1-flash-image)
              </span>
              <span className="text-[11px] font-mono text-cyan-400">High-Resolution Studio</span>
            </div>

            <textarea
              rows={3}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Describe image to generate..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait / Mobile)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="3:4">3:4 (Vertical)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Resolution</label>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                >
                  <option value="1K">1K (1024px)</option>
                  <option value="2K">2K (2048px)</option>
                  <option value="4K">4K Ultra HD</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingImage ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Generate Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {generatedImageUrl && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="mx-auto max-h-96 rounded-lg object-contain shadow-2xl"
                />
                <div className="flex items-center justify-center gap-3 mt-3">
                  <a
                    href={generatedImageUrl}
                    download="generated-image.png"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Music Panel */}
        {activeTool === 'music' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Music Generation (lyria-3-clip-preview)
              </span>
              <span className="text-[11px] font-mono text-purple-400">30s Audio Track</span>
            </div>

            <textarea
              rows={3}
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              placeholder="Describe the musical genre, tempo, instruments, and mood..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500/50"
            />

            <button
              onClick={handleGenerateMusic}
              disabled={isGeneratingMusic || !musicPrompt.trim()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingMusic ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Composing Audio with Lyria...</span>
                </>
              ) : (
                <>
                  <Music2 className="w-3.5 h-3.5" />
                  <span>Generate Music Clip (30s)</span>
                </>
              )}
            </button>

            {musicAudioUrl && (
              <div className="mt-4 p-4 rounded-lg bg-purple-950/20 border border-purple-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-purple-300 font-mono">
                  <Music2 className="w-4 h-4 text-purple-400" />
                  <span>Lyria Music Track Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePlay(musicAudioUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                  >
                    {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlayingAudio ? 'Pause' : 'Play Music'}</span>
                  </button>
                  <a
                    href={musicAudioUrl}
                    download="lyria-clip.wav"
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Download Track"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
