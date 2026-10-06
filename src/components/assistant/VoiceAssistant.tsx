import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Globe,
  Radio,
  Sparkles,
  Bot,
  User,
  Navigation
} from 'lucide-react';
import { speechService, SpeechLanguage, AssistantMessage, AssistantStatus } from '../../services/speechService';
import { useNavigate } from 'react-router-dom';

export const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SpeechLanguage>('en');
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am RouteMind AI. Ask me about live routes, vehicle tracking, traffic conditions, or accessibility in English, தமிழ், or हिन्दी.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: 'en'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleLanguageChange = (lang: SpeechLanguage) => {
    setSelectedLang(lang);
    speechService.setLanguage(lang);

    const greetingMap: Record<SpeechLanguage, string> = {
      en: 'Language set to English. Ask me about routes, vehicles, or traffic.',
      ta: 'மொழி தமிழுக்கு மாற்றப்பட்டது. வழித்தடங்கள் அல்லது வண்டி நிலை பற்றி கேளுங்கள்.',
      hi: 'भाषा हिंदी में बदली गई। आप रूट्स या वाहन स्थिति के बारे में पूछ सकते हैं।'
    };

    setMessages((prev) => [
      ...prev,
      {
        id: `lang_${Date.now()}`,
        sender: 'assistant',
        text: greetingMap[lang],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: lang
      }
    ]);
  };

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query) return;

    // Add user message
    const userMsg: AssistantMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: selectedLang
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setStatus('processing');
    setStatusText('Processing intelligence...');

    try {
      const response = await speechService.processQuery(query, selectedLang);

      const aiMsg: AssistantMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: response.language
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Handle contextual actions
      if (response.action === 'NAVIGATE_LIVE_TRACKER') {
        navigate('/live-tracker');
      } else if (response.action === 'NAVIGATE_ACCESSIBILITY') {
        navigate('/accessibility');
      }

      // Speak response if not muted
      if (!isMuted) {
        setStatus('speaking');
        setStatusText('Speaking...');
        speechService.speak(response.text, response.language, () => {
          setStatus('idle');
          setStatusText('');
        });
      } else {
        setStatus('idle');
        setStatusText('');
      }
    } catch (err) {
      setStatus('idle');
      setStatusText('');
    }
  };

  const handleStartListening = () => {
    if (status === 'listening') {
      speechService.stopListening();
      setStatus('idle');
      setStatusText('');
      return;
    }

    setStatus('listening');
    setStatusText('Listening... Speak now');

    speechService.listen(
      (transcript) => {
        if (transcript) {
          handleSendMessage(transcript);
        } else {
          setStatus('idle');
          setStatusText('');
        }
      },
      (error) => {
        setStatus('error');
        setStatusText(error);
        setTimeout(() => {
          setStatus('idle');
          setStatusText('');
        }, 4000);
      },
      () => {
        setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
        setStatusText('');
      }
    );
  };

  const handleToggleMute = () => {
    if (!isMuted) {
      speechService.stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 dark:bg-slate-900 light:bg-white text-white dark:text-white light:text-slate-900 border border-cyan-500/40 shadow-xl shadow-cyan-950/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Open RouteMind AI Voice Assistant"
        >
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5 animate-ping" />
            <Mic className="w-5 h-5 text-cyan-400 group-hover:rotate-6 transition-transform" />
          </div>
          <span className="text-xs font-extrabold tracking-wide">RouteMind Assistant</span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
            EN • தமிழ் • हि
          </span>
        </button>
      )}

      {/* Assistant Modal / Dock */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl bg-slate-900/95 dark:bg-[#0c1220]/95 light:bg-white/95 border border-slate-700/80 dark:border-slate-800 light:border-slate-200 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-800 dark:border-slate-800 light:border-slate-100 flex items-center justify-between bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white dark:text-white light:text-slate-900">
                    RouteMind Assistant
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-400 light:text-slate-500 block leading-tight">
                  Voice & Logistics Intelligence
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleMute}
                title={isMuted ? 'Unmute speech output' : 'Mute speech output'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-800 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
              <button
                onClick={() => {
                  speechService.stopListening();
                  speechService.stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Language Selector Bar */}
          <div className="px-4 py-2 bg-slate-950/30 dark:bg-slate-950/30 light:bg-slate-100/60 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 light:text-slate-600">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Language:</span>
            </div>
            <div className="flex items-center gap-1">
              {(
                [
                  { code: 'en', label: 'English' },
                  { code: 'ta', label: 'தமிழ்' },
                  { code: 'hi', label: 'हिन्दी' }
                ] as const
              ).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedLang === lang.code
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200/80'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl leading-relaxed text-[12px] shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 text-slate-100 dark:text-slate-100 light:text-slate-800 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Quick Sample Queries */}
            {messages.length <= 2 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 light:text-slate-500 block">
                  Suggested Questions:
                </span>
                <div className="flex flex-col gap-1 text-[11px]">
                  <button
                    onClick={() => handleSendMessage('Coimbatore to Madurai route sollu')}
                    className="p-1.5 rounded-lg bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-cyan-300 text-left border border-slate-700/50 transition-colors"
                  >
                    💬 "Coimbatore to Madurai route sollu"
                  </button>
                  <button
                    onClick={() => handleSendMessage('கோயம்புத்தூர்ல இருந்து மதுரைக்கு எந்த ரூட் நல்லது?')}
                    className="p-1.5 rounded-lg bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-cyan-300 text-left border border-slate-700/50 transition-colors"
                  >
                    💬 "கோயம்புத்தூர்ல இருந்து மதுரைக்கு எந்த ரூட் நல்லது?"
                  </button>
                  <button
                    onClick={() => handleSendMessage('Where is my vehicle?')}
                    className="p-1.5 rounded-lg bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-cyan-300 text-left border border-slate-700/50 transition-colors"
                  >
                    💬 "Where is my vehicle?"
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Status Indicator */}
          {statusText && (
            <div className="px-4 py-1.5 bg-cyan-950/40 dark:bg-cyan-950/40 light:bg-cyan-50 border-t border-cyan-500/20 text-cyan-300 dark:text-cyan-300 light:text-cyan-700 text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {statusText}
              </span>
              {status === 'speaking' && (
                <button
                  onClick={() => speechService.stopSpeaking()}
                  className="text-[10px] underline hover:text-white"
                >
                  Stop Speaking
                </button>
              )}
            </div>
          )}

          {/* Input & Controls */}
          <div className="p-3 bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center gap-2">
            {/* Microphone Button */}
            <button
              onClick={handleStartListening}
              title={status === 'listening' ? 'Stop listening' : 'Start speaking'}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                status === 'listening'
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              {status === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputText);
              }}
              placeholder={
                selectedLang === 'ta'
                  ? 'தமிழில் கேளுங்கள் அல்லது தட்டச்சு செய்க...'
                  : selectedLang === 'hi'
                  ? 'यहाँ टाइप करें या पूछें...'
                  : 'Ask in English or speak...'
              }
              className="flex-1 px-3 py-2 text-xs bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 hover:text-white dark:hover:text-white hover:bg-cyan-500 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
