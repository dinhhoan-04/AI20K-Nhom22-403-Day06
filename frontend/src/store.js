import { create } from 'zustand';
import { api } from './api';

export const useStore = create((set, get) => ({
  carState: {
    ac: { is_on: false, temperature: 24.0 },
    tires: { front_left: 2.4, front_right: 2.4, rear_left: 2.4, rear_right: 2.4 },
    lights: { is_on: false },
    doors: { is_locked: true }
  },
  chatHistory: [
    { role: 'agent', content: 'Xin chào, tôi là trợ lý thông minh VinFast. Bạn cần giúp gì về xe không?' }
  ],
  isPolling: false,
  isAgentTyping: false,

  fetchCarState: async () => {
    try {
      const state = await api.getCarState();
      set({ carState: state });
    } catch (e) {
      console.error("Failed to fetch car state", e);
    }
  },

  startPolling: () => {
    if (get().isPolling) return;
    set({ isPolling: true });
    // First load
    get().fetchCarState();
    // Start interval
    setInterval(() => {
      get().fetchCarState();
    }, 2500);
  },

  addMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),

  speakResponse: (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      
      const setVoiceAndSpeak = () => {
         const voices = window.speechSynthesis.getVoices();
         const viVoice = voices.find(v => v.lang === 'vi-VN' || v.lang === 'vi') || voices.find(v => v.lang.includes('vi'));
         if (viVoice) utterance.voice = viVoice;
         window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
         setVoiceAndSpeak();
      } else {
         window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
      }
    }
  },

  sendMessage: async (message) => {
    get().addMessage({ role: 'user', content: message });
    set({ isAgentTyping: true });
    
    // Simulate tool log for exact replica experience
    let fakeTool = null;
    const lower = message.toLowerCase();
    if (lower.includes('bật') && (lower.includes('điều') || lower.includes('hoà'))) fakeTool = 'turn_on_ac()';
    if (lower.includes('tắt') && (lower.includes('điều') || lower.includes('hoà'))) fakeTool = 'turn_off_ac()';
    if (lower.includes('nhiệt độ')) fakeTool = 'set_ac_temperature()';
    if (lower.includes('đèn') && lower.includes('bật')) fakeTool = 'turn_on_lights()';
    if (lower.includes('đèn') && lower.includes('tắt')) fakeTool = 'turn_off_lights()';
    if (fakeTool) {
       setTimeout(() => get().addMessage({ type: 'tool_info', content: `Calling tool: ${fakeTool}` }), 800);
    }

    try {
      const res = await api.chat(message);
      get().addMessage({ role: 'agent', content: res.response });
      get().speakResponse(res.response);
      // Fetch immediately to reflect fast state changes
      setTimeout(() => get().fetchCarState(), 500);
    } catch (e) {
      const errorMsg = 'Hệ thống đang lỗi. Vui lòng thử lại sau.';
      get().addMessage({ role: 'agent', content: errorMsg });
      get().speakResponse(errorMsg);
    } finally {
      set({ isAgentTyping: false });
    }
  }
}));
