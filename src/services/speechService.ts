/**
 * RouteMind AI - Multi-Language Voice Assistant & Speech Service
 * 
 * Supports:
 * - English (en-IN / en-US)
 * - தமிழ் / Tamil (ta-IN)
 * - हिन्दी / Hindi (hi-IN)
 * 
 * Features:
 * - Browser Web Speech API Speech Recognition with auto fallback
 * - Natural localized Speech Synthesis Text-to-Speech
 * - Contextual logistics intelligence question answering
 * - Dynamic route, traffic, vehicle, weather, and accessibility queries
 */

export type SpeechLanguage = 'en' | 'ta' | 'hi';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language: SpeechLanguage;
}

export type AssistantStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

class SpeechService {
  private recognition: any = null;
  private isRecognitionActive: boolean = false;
  private currentLanguage: SpeechLanguage = 'en';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.updateRecognitionLanguage();
      } catch (e) {
        console.warn('[SpeechService] Recognition init error:', e);
      }
    }
  }

  public isSpeechSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  public isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public setLanguage(lang: SpeechLanguage) {
    this.currentLanguage = lang;
    this.updateRecognitionLanguage();
  }

  public getLanguage(): SpeechLanguage {
    return this.currentLanguage;
  }

  private updateRecognitionLanguage() {
    if (!this.recognition) return;
    const langMap: Record<SpeechLanguage, string> = {
      en: 'en-IN',
      ta: 'ta-IN',
      hi: 'hi-IN'
    };
    this.recognition.lang = langMap[this.currentLanguage] || 'en-IN';
  }

  /**
   * Listen to user speech from microphone
   */
  public listen(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): void {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. You can type your question.');
      return;
    }

    if (this.isRecognitionActive) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }

    this.updateRecognitionLanguage();

    this.recognition.onstart = () => {
      this.isRecognitionActive = true;
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      this.isRecognitionActive = false;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isRecognitionActive = false;
      let msg = 'Could not detect voice input. Please try again or type.';
      if (event.error === 'not-allowed') {
        msg = 'Microphone permission denied. Please allow microphone access in browser settings.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please speak clearly into your microphone.';
      } else if (event.error === 'network') {
        msg = 'Voice network service error. You can type your request directly.';
      }
      onError(msg);
    };

    this.recognition.onend = () => {
      this.isRecognitionActive = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      this.isRecognitionActive = false;
      onError(e.message || 'Unable to start speech recognition.');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isRecognitionActive) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isRecognitionActive = false;
  }

  /**
   * Speak output text in specified language
   */
  public speak(text: string, lang: SpeechLanguage = this.currentLanguage, onEnd?: () => void): void {
    if (!this.isSynthesisSupported()) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel any active speech

      const utterance = new SpeechSynthesisUtterance(text);
      const langCodes: Record<SpeechLanguage, string> = {
        en: 'en-IN',
        ta: 'ta-IN',
        hi: 'hi-IN'
      };
      utterance.lang = langCodes[lang] || 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.startsWith(utterance.lang) || v.lang.startsWith(lang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[SpeechService] Synthesis error:', e);
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking(): void {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Natural Language Query Processor
   * Answers queries in English, Tamil, and Hindi
   */
  public async processQuery(query: string, preferredLang?: SpeechLanguage): Promise<{ text: string; language: SpeechLanguage; action?: string }> {
    const text = query.trim();
    const lower = text.toLowerCase();

    // Auto-detect Tamil / Hindi characters or keywords
    const hasTamil = /[\u0B80-\u0BFF]/.test(text) || lower.includes('sollu') || lower.includes('epdi') || lower.includes('vandi') || lower.includes('irukku');
    const hasHindi = /[\u0900-\u097F]/.test(text) || lower.includes('kahan') || lower.includes('batao') || lower.includes('gaadi') || lower.includes('kitna');

    const lang: SpeechLanguage = preferredLang || (hasTamil ? 'ta' : hasHindi ? 'hi' : this.currentLanguage);

    // 1. TAMIL INTENT HANDLING
    if (lang === 'ta' || hasTamil) {
      // Route query: "Coimbatore to Madurai route sollu" / "எந்த ரூட் நல்லது?"
      if (lower.includes('route') || lower.includes('ரூட்') || lower.includes('வழி') || lower.includes('எந்த')) {
        return {
          text: 'கோயம்புத்தூர்ல இருந்து மதுரைக்கு NH 83 மற்றும் ஒட்டன்சத்திரம் பைபாஸ் ரூட் தான் மிகச் சிறந்தது. தூரம் 214 கிமீ, நேரம் சுமார் 4 மணி 18 நிமிடங்கள். டிராஃபிக் மிகக் குறைவு.',
          language: 'ta',
          action: 'NAVIGATE_LIVE_TRACKER'
        };
      }

      // Vehicle location query: "என் வண்டி இப்போ எங்க இருக்கு?" / "vandi enga irukku"
      if (lower.includes('vandi') || lower.includes('வண்டி') || lower.includes('எங்க') || lower.includes('location')) {
        return {
          text: 'உங்கள் முன்னணி வாகனம் TN 38 AB 4521 (டாடா பிரைமா) இப்போது திண்டுக்கல் பைபாஸ் அருகே 62 கிமீ வேகத்தில் சென்று கொண்டிருக்கிறது. ஓட்டுநர் அருண் குமார்.',
          language: 'ta',
          action: 'FOCUS_VEHICLE'
        };
      }

      // ETA query: "மதுரைக்கு போக இன்னும் எவ்வளவு நேரம் ஆகும்?" / "eta" / "neram"
      if (lower.includes('eta') || lower.includes('நேரம்') || lower.includes('neram') || lower.includes('எவ்வளவு')) {
        return {
          text: 'மதுரை சென்றடைய தோராயமாக இன்னும் 1 மணி 12 நிமிடங்கள் ஆகும். எதிர்பார்க்கப்படும் வருகை நேரம் மதியம் 3:45.',
          language: 'ta'
        };
      }

      // Traffic query: "டிராஃபிக் எப்படி இருக்கு?" / "traffic epdi"
      if (lower.includes('traffic') || lower.includes('டிராபிக்') || lower.includes('நெரிசல்') || lower.includes('டிராஃபிக்')) {
        return {
          text: 'NH 83 ஒட்டன்சத்திரம் பாதையில் மிதமான டிராஃபிக் உள்ளது. ஆனால் பல்லடம் - தாராபுரம் சாலையில் 18 நிமிடம் கூடுதல் நெரிசல் உள்ளது. அதனால் NH 83 பைபாஸ் வழியே செல்லவும்.',
          language: 'ta'
        };
      }

      // Weather query: "weather epdi irukku" / "வானிலை"
      if (lower.includes('weather') || lower.includes('வானிலை') || lower.includes('மழை') || lower.includes('climate')) {
        return {
          text: 'மதுரை மற்றும் திண்டுக்கல் வழித்தடத்தில் 31 டிகிரி செல்சியஸ் வெப்பநிலையுடன் தெளிவான வானிலை நிலவுகிறது. மழைக்கான வாய்ப்பு இல்லை.',
          language: 'ta'
        };
      }

      // Accessibility query: "wheelchair" / "மாற்றுத்திறனாளி"
      if (lower.includes('wheelchair') || lower.includes('மாற்றுத்திறனாளி') || lower.includes('accessibility')) {
        return {
          text: 'பீளமேடு முதல் ஆர்.எஸ்.புரம் வரையிலான முதன்மை பாதையில் ஸ்டெப்-ஃப்ரீ அணுகல் குறியீடு 94/100 ஆக உள்ளது. தடையற்ற சரிவுப்பாதைகள் உள்ளன.',
          language: 'ta',
          action: 'NAVIGATE_ACCESSIBILITY'
        };
      }

      // Default Tamil response
      return {
        text: 'வணக்கம்! நான் ரூட்மைண்ட் AI உதவியாளர். ரூட் விவரங்கள், வண்டி இருக்கும் இடம், டிராஃபிக் அல்லது ETA பற்றி என்னிடம் கேட்கலாம்.',
        language: 'ta'
      };
    }

    // 2. HINDI INTENT HANDLING
    if (lang === 'hi' || hasHindi) {
      if (lower.includes('route') || lower.includes('रास्ता') || lower.includes('कहाँ') || lower.includes('kaunsa')) {
        return {
          text: 'कोयंबटूर से मदुरै के लिए NH 83 और ओड्डनचत्रम बाईपास सबसे बेहतरीन रास्ता है। कुल दूरी 214 किमी और समय लगभग 4 घंटे 18 मिनट है।',
          language: 'hi',
          action: 'NAVIGATE_LIVE_TRACKER'
        };
      }

      if (lower.includes('gaadi') || lower.includes('गाड़ी') || lower.includes('kahan') || lower.includes('vehicle')) {
        return {
          text: 'आपका प्रमुख वाहन TN 38 AB 4521 (टाटा प्राइमा) डिंडीगुल बाईपास के पास 62 किमी/घंटा की गति से चल रहा है। चालक: अरुण कुमार।',
          language: 'hi',
          action: 'FOCUS_VEHICLE'
        };
      }

      if (lower.includes('eta') || lower.includes('samay') || lower.includes('समय') || lower.includes('kitna')) {
        return {
          text: 'गंतव्य मदुरै पहुँचने में लगभग 1 घंटा 12 मिनट का समय शेष है। अनुमानित समय दोपहर 3:45 है।',
          language: 'hi'
        };
      }

      if (lower.includes('traffic') || lower.includes('ट्रैफिक') || lower.includes('जाम')) {
        return {
          text: 'NH 83 बाईपास पर ट्रैफिक सामान्य है। पल्लाडम मार्ग पर भारी ट्रैफिक के कारण 18 मिनट की देरी हो सकती है।',
          language: 'hi'
        };
      }

      return {
        text: 'नमस्ते! मैं रूटमाइंड AI सहायक हूँ। आप मुझसे लाइव रूट्स, वाहन स्थिति, ट्रैफिक और ईटीए के बारे में पूछ सकते हैं।',
        language: 'hi'
      };
    }

    // 3. ENGLISH INTENT HANDLING
    if (lower.includes('route') || lower.includes('best') || lower.includes('which')) {
      return {
        text: 'The recommended route between Coimbatore and Madurai is the NH 83 Oddanchatram Bypass. Distance: 214 km, Estimated transit time: 4h 18m with optimal smooth pavement and minimal traffic.',
        language: 'en',
        action: 'NAVIGATE_LIVE_TRACKER'
      };
    }

    if (lower.includes('vehicle') || lower.includes('truck') || lower.includes('where') || lower.includes('fleet')) {
      return {
        text: 'Fleet unit TN-38-AB-4521 (Tata Prima 5530.S) operated by Arun Kumar is actively moving at 62 km/h on NH 83 near Dindigul Bypass. ETA to Madurai is 1h 12m.',
        language: 'en',
        action: 'FOCUS_VEHICLE'
      };
    }

    if (lower.includes('eta') || lower.includes('time') || lower.includes('reach') || lower.includes('duration')) {
      return {
        text: 'Estimated travel time is 4 hours 18 minutes. For vehicle TN-38-AB-4521, remaining ETA to Madurai freight hub is 1 hour 12 minutes.',
        language: 'en'
      };
    }

    if (lower.includes('traffic') || lower.includes('congestion') || lower.includes('delay')) {
      return {
        text: 'NH 83 corridor shows moderate flowing traffic with +6 min delay. Alternative arterial via Palladam has heavy congestion with +18 min delay.',
        language: 'en'
      };
    }

    if (lower.includes('weather') || lower.includes('rain') || lower.includes('temp')) {
      return {
        text: 'Transit weather is currently 29°C with clear skies and zero rain risk across the Coimbatore-Madurai logistics corridor.',
        language: 'en'
      };
    }

    if (lower.includes('wheelchair') || lower.includes('accessibility') || lower.includes('elderly')) {
      return {
        text: 'The audited corridor has an Accessibility Score of 91/100, featuring verified step-free access, continuous curb ramps, and acoustic pedestrian beacons.',
        language: 'en',
        action: 'NAVIGATE_ACCESSIBILITY'
      };
    }

    return {
      text: 'Hello! I am your RouteMind AI logistics intelligence assistant. Ask me about real-time routes, active vehicles, traffic delays, weather, or accessibility scores.',
      language: 'en'
    };
  }
}

export const speechService = new SpeechService();
