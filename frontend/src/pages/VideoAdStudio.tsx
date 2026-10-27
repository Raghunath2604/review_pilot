import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  Sparkles,
  Clapperboard,
  Film,
  Subtitles,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { VideoAdResponse, VideoAdScene, VideoAdTemplate } from '../types/video-ad';

export const VideoAdStudio: React.FC = () => {
  const [templates, setTemplates] = useState<VideoAdTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('reviewpilot-flagship');
  const [productName, setProductName] = useState<string>('ReviewPilot');
  const [targetAudience, setTargetAudience] = useState<string>('Senior Engineers & Tech Leads');
  const [tone, setTone] = useState<string>('High-Energy Cinematic & Authoritative Tech');
  const [duration, setDuration] = useState<'15s' | '30s' | '60s'>('30s');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ad, setAd] = useState<VideoAdResponse | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Canvas & Audio refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Pre-load scene images
  const loadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Fetch initial templates & generate default ReviewPilot ad
  useEffect(() => {
    const init = async () => {
      try {
        const { templates } = await api.getVideoAdTemplates();
        setTemplates(templates);
      } catch (err) {
        console.warn('Failed to load templates', err);
      }
      handleGenerate();
    };
    init();
  }, []);

  // Preload images whenever ad changes
  useEffect(() => {
    if (!ad) return;
    ad.scenes.forEach((scene) => {
      if (scene.imageUrl && !loadedImagesRef.current.has(scene.imageUrl)) {
        const img = new Image();
        img.src = scene.imageUrl;
        img.onload = () => {
          loadedImagesRef.current.set(scene.imageUrl!, img);
        };
      }
    });
  }, [ad]);

  // Audio synthesizer using Web Audio API
  const playSynthesizerTone = useCallback((type: 'transition' | 'alert' | 'success') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'transition') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now); // Low A
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(280, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'success') {
        const notes = [440, 554.37, 659.25]; // A major triad
        notes.forEach((freq, idx) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.type = 'triangle';
          chordOsc.frequency.setValueAtTime(freq, now + idx * 0.05);
          chordGain.gain.setValueAtTime(0.08, now + idx * 0.05);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.start(now + idx * 0.05);
          chordOsc.stop(now + 0.6);
        });
      }
    } catch {
      // AudioContext could be blocked by browser policy until user interacts
    }
  }, [isMuted]);

  // Main canvas animation render loop
  const renderCanvasFrame = useCallback(
    (timeSec: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !ad || ad.scenes.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Find current scene based on timeSec
      let elapsed = 0;
      let activeScene = ad.scenes[0];
      let activeSceneIdx = 0;
      let sceneProgress = 0;

      for (let i = 0; i < ad.scenes.length; i++) {
        const sc = ad.scenes[i];
        if (timeSec >= elapsed && timeSec <= elapsed + sc.durationSec) {
          activeScene = sc;
          activeSceneIdx = i;
          sceneProgress = (timeSec - elapsed) / sc.durationSec;
          break;
        }
        elapsed += sc.durationSec;
      }

      if (timeSec >= ad.durationTotalSec) {
        activeScene = ad.scenes[ad.scenes.length - 1];
        activeSceneIdx = ad.scenes.length - 1;
        sceneProgress = 1;
      }

      if (activeSceneIdx !== currentSceneIndex) {
        setCurrentSceneIndex(activeSceneIdx);
        playSynthesizerTone(activeSceneIdx === 0 ? 'alert' : activeSceneIdx === 2 ? 'success' : 'transition');
      }

      // 1. Draw Background: Image or Dark Cyber Mesh
      ctx.fillStyle = '#090814';
      ctx.fillRect(0, 0, width, height);

      const cachedImg = activeScene.imageUrl ? loadedImagesRef.current.get(activeScene.imageUrl) : null;
      if (cachedImg && cachedImg.complete) {
        // Ken Burns effect: subtle slow zoom in
        const zoom = 1 + sceneProgress * 0.06;
        const dw = width * zoom;
        const dh = height * zoom;
        const dx = (width - dw) / 2;
        const dy = (height - dh) / 2;
        ctx.drawImage(cachedImg, dx, dy, dw, dh);

        // Dark gradient vignette overlay for cinematic readability
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(10, 8, 24, 0.45)');
        gradient.addColorStop(0.5, 'rgba(10, 8, 24, 0.25)');
        gradient.addColorStop(1, 'rgba(10, 8, 24, 0.85)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Fallback procedural atmospheric background
        const grad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width);
        grad.addColorStop(0, '#1E1538');
        grad.addColorStop(1, '#090814');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. HUD Header: Scene Indicator & Gemini Model Badge
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`SCENE 0${activeScene.sceneNumber} // ${activeScene.title.toUpperCase()}`, 60, 70);

      // Pill Badge: Gemini Pro
      ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.beginPath();
      ctx.roundRect(width - 290, 45, 230, 36, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#C7D2FE';
      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✨ Powered by Gemini Pro', width - 275, 69);
      ctx.restore();

      // 3. Highlight Badge Overlay (e.g. 99.4% Precision or SQL Injection)
      if (activeScene.highlightBadge) {
        ctx.save();
        const badgeX = 60;
        const badgeY = 110;
        ctx.fillStyle = activeSceneIdx === 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)';
        ctx.strokeStyle = activeSceneIdx === 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, 320, 44, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = activeSceneIdx === 0 ? '#FCA5A5' : '#6EE7B7';
        ctx.font = '700 18px "JetBrains Mono", monospace';
        ctx.fillText(`[⚡] ${activeScene.highlightBadge}`, badgeX + 16, badgeY + 28);
        ctx.restore();
      }

      // 4. Code Snippet Terminal (Center overlay if present)
      if (activeScene.codeSnippet) {
        ctx.save();
        const termX = 60;
        const termY = 180;
        const termW = width - 120;
        const termH = 140;

        ctx.fillStyle = 'rgba(15, 13, 29, 0.85)';
        ctx.beginPath();
        ctx.roundRect(termX, termY, termW, termH, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Terminal dots
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(termX + 24, termY + 24, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(termX + 44, termY + 24, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(termX + 64, termY + 24, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '500 13px "JetBrains Mono", monospace';
        ctx.fillText('vulnerability_analysis.ts', termX + 88, termY + 28);

        // Typewriter animation of code snippet
        const charCount = Math.floor(sceneProgress * activeScene.codeSnippet.length * 1.5);
        const displayedCode = activeScene.codeSnippet.slice(0, Math.min(charCount, activeScene.codeSnippet.length));

        ctx.fillStyle = activeSceneIdx === 0 ? '#F87171' : '#34D399';
        ctx.font = '600 20px "JetBrains Mono", monospace';
        ctx.fillText(displayedCode, termX + 28, termY + 80);

        // Blinking cursor
        if (Math.floor(timeSec * 3) % 2 === 0) {
          const textMetrics = ctx.measureText(displayedCode);
          ctx.fillStyle = '#818CF8';
          ctx.fillRect(termX + 32 + textMetrics.width, termY + 62, 10, 22);
        }
        ctx.restore();
      }

      // 5. Cinematic Subtitles / Voiceover Captions (Bottom Center)
      ctx.save();
      const subBoxH = 100;
      const subBoxY = height - subBoxH - 50;
      ctx.fillStyle = 'rgba(10, 8, 22, 0.85)';
      ctx.beginPath();
      ctx.roundRect(80, subBoxY, width - 160, subBoxH, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeScene.subtitleText, width / 2, subBoxY + 44);

      ctx.fillStyle = 'rgba(199, 210, 254, 0.8)';
      ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`VO: "${activeScene.voiceoverText.slice(0, 95)}..."`, width / 2, subBoxY + 76);
      ctx.restore();

      // 6. Time & Progress Bar
      ctx.save();
      const barY = height - 12;
      const barW = width;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, barY, barW, 12);

      const progressRatio = Math.min(timeSec / ad.durationTotalSec, 1);
      ctx.fillStyle = '#6366F1';
      ctx.fillRect(0, barY, barW * progressRatio, 12);
      ctx.restore();
    },
    [ad, currentSceneIndex, isMuted, playSynthesizerTone]
  );

  // Playback loop
  useEffect(() => {
    if (!isPlaying || !ad) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimestampRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }
      const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + deltaSec;
        if (next >= ad.durationTotalSec) {
          setIsPlaying(false);
          return ad.durationTotalSec;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, ad]);

  // Re-render canvas whenever currentTime changes
  useEffect(() => {
    renderCanvasFrame(currentTime);
  }, [currentTime, renderCanvasFrame]);

  // Generate ad using backend Gemini Pro service
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await api.generateVideoAd({
        productName,
        targetAudience,
        tone,
        duration,
      });
      if (response.success && response.ad) {
        setAd(response.ad);
        setCurrentTime(0);
        setCurrentSceneIndex(0);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Failed to generate ad', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch template
  const handleTemplateSelect = (template: VideoAdTemplate) => {
    setSelectedTemplateId(template.id);
    setProductName(template.productName);
    setTargetAudience(template.targetAudience);
    setTone(template.tone);
    setDuration(template.duration);
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (currentTime >= (ad?.durationTotalSec || 30)) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Reset to 0
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentSceneIndex(0);
  };

  // Copy Runway / Sora prompt for a scene
  const copyScenePrompt = (scene: VideoAdScene, idx: number) => {
    const text = `Cinematic broadcast commercial shot. ${scene.visualPrompt} Camera direction: ${scene.cameraDirection}. High production value, 8k resolution, cinematic lighting, ultra-detailed.`;
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(idx);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  // Export .SRT Subtitle file
  const exportSRT = () => {
    if (!ad) return;
    let srt = '';
    let elapsed = 0;

    ad.scenes.forEach((scene, index) => {
      const startSec = elapsed;
      const endSec = elapsed + scene.durationSec;
      elapsed = endSec;

      const formatSRTTime = (seconds: number) => {
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
        const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
        return `${hrs}:${mins}:${secs},${ms}`;
      };

      srt += `${index + 1}\n${formatSRTTime(startSec)} --> ${formatSRTTime(endSec)}\n${scene.subtitleText}\n\n`;
    });

    const blob = new Blob([srt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName.toLowerCase().replace(/\s+/g, '-')}-ad-subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 1-Click Record & Download Live Video (.webm) using MediaRecorder API
  const startRecordingCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ad) return;

    try {
      const stream = canvas.captureStream(30); // 30 FPS stream
      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productName.toLowerCase().replace(/\s+/g, '-')}-cinematic-ad.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      setIsRecording(true);
      setCurrentTime(0);
      setIsPlaying(true);
      recorder.start();

      // Automatically stop recorder when duration ends
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsPlaying(false);
        }
      }, (ad.durationTotalSec + 0.5) * 1000);
    } catch (err) {
      console.warn('Canvas MediaRecorder not supported in this browser environment', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Studio Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>Google Gemini Pro Video Ad Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            AI Video Ad Studio for{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              High-Converting Tech Demos
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg text-slate-600">
            Generate broadcast-ready video ads, scene-by-scene cinematic storyboards, and synchronized motion previews
            crafted for engineering leaders and high-velocity developer tools.
          </p>
        </div>

        {/* Template Selector & Control Deck */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-indigo-600" />
                Select Video Ad Concept or Customize
              </h2>
              <p className="text-sm text-slate-500">Pick an industry-tested prompt template or tailor your script.</p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating with Gemini Pro...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Regenerate with Gemini Pro
                </>
              )}
            </button>
          </div>

          {/* Template Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => handleTemplateSelect(tpl)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all text-left ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                      : 'border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">{tpl.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {tpl.duration}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{tpl.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                    <span>Use Template</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Form Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tone & Aesthetic</label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="15s">15 Seconds (Teaser Ad)</option>
                <option value="30s">30 Seconds (Standard Commercial)</option>
                <option value="60s">60 Seconds (Deep-Dive Explainer)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Cinematic Video Player Section */}
        {ad && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Player Canvas Area */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-contain" />

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider animate-pulse shadow-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>Recording Video Stream...</span>
                </div>
              )}
            </div>

            {/* Playback Controls Deck */}
            <div className="bg-slate-900/90 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Play / Pause / Reset & Timecode */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-indigo-600/30"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={handleReset}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                  title="Restart to Beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isMuted ? 'bg-slate-800 text-slate-500' : 'bg-indigo-950 text-indigo-400 border border-indigo-700/50'
                  }`}
                  title={isMuted ? 'Unmute Web Audio Synthesizer' : 'Mute Sound'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="text-sm font-mono text-slate-400 ml-2">
                  <span className="text-white font-semibold">{currentTime.toFixed(1)}s</span> / {ad.durationTotalSec}s
                </div>
              </div>

              {/* Scene Pills Indicator */}
              <div className="flex items-center gap-2">
                {ad.scenes.map((scene, idx) => {
                  const isActive = idx === currentSceneIndex;
                  return (
                    <button
                      key={scene.sceneNumber}
                      onClick={() => {
                        let offset = 0;
                        for (let i = 0; i < idx; i++) offset += ad.scenes[i].durationSec;
                        setCurrentTime(offset);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      Scene 0{scene.sceneNumber}
                    </button>
                  );
                })}
              </div>

              {/* Export Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={startRecordingCanvas}
                  disabled={isRecording}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                  title="Record the live animated preview and download as WebM video"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>{isRecording ? 'Recording...' : 'Export Video (.webm)'}</span>
                </button>

                <button
                  onClick={exportSRT}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                  title="Download subtitle captions as .SRT"
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>Export .SRT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Storyboard & AI Video Prompt Generator Cards */}
        {ad && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Scene-by-Scene Cinematic Storyboard
                </h3>
                <p className="text-sm text-slate-500">
                  Visual prompts tailored for modern AI video models (Runway Gen-3, Luma Dream Machine, OpenAI Sora).
                </p>
              </div>

              <div className="text-xs font-mono px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Generated by {ad.generatedBy}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {ad.scenes.map((scene, idx) => {
                const isCopied = copiedPromptIndex === idx;
                return (
                  <div
                    key={scene.sceneNumber}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Scene Visual Preview */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      {scene.imageUrl ? (
                        <img
                          src={scene.imageUrl}
                          alt={scene.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                          Generating Visual...
                        </div>
                      )}

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm text-white font-mono text-xs font-bold">
                        Scene 0{scene.sceneNumber} • {scene.durationSec}s
                      </div>

                      {scene.highlightBadge && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-indigo-600/90 text-white font-mono text-xs font-semibold backdrop-blur-sm">
                          {scene.highlightBadge}
                        </div>
                      )}
                    </div>

                    {/* Scene Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base mb-1">{scene.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Camera: {scene.cameraDirection}</span>
                        </div>

                        {/* Voiceover Script */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 mb-3">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Voiceover Narration
                          </span>
                          <p className="text-xs text-slate-700 italic leading-relaxed">"{scene.voiceoverText}"</p>
                        </div>

                        {/* Prompt Description */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Visual Prompt (Runway / Sora)
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{scene.visualPrompt}</p>
                        </div>
                      </div>

                      {/* Copy Prompt Button */}
                      <button
                        onClick={() => copyScenePrompt(scene, idx)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Prompt Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-slate-500" />
                            <span>Copy Prompt for Video Generator</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature Highlights Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h4 className="text-2xl font-bold">Deploy Your Next Video Ad Campaign in Seconds</h4>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Every storyboard generated by ReviewPilot adheres to standard 16:9 and 9:16 aspect ratios, includes
              broadcast-ready voiceover pacing, and exports directly to `.srt` subtitle files and WebM video captures.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const jsonStr = JSON.stringify(ad, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${productName.toLowerCase().replace(/\s+/g, '-')}-storyboard.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-950 font-bold text-sm hover:bg-indigo-50 transition-transform active:scale-95 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Export Storyboard JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
