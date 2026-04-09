import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send } from 'lucide-react';
import { useStore } from '../store';

const ChatPanel = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { chatHistory, sendMessage, isAgentTyping } = useStore();
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAgentTyping]);

  let recognition = null;
  if ('webkitSpeechRecognition' in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'vi-VN';
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      setIsListening(false);
      sendMessage(transcript);
      setText('');
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  return (
    <div className="bg-[#12151B] h-[calc(100vh-3rem)] my-6 mr-6 rounded-3xl flex flex-col overflow-hidden border border-[#232930] shadow-2xl">
      
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-transparent bg-transparent shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
             {/* VF Logo icon mock */}
             <div className="w-9 h-9 bg-gradient-to-br from-[#1b2b3b] to-[#121b25] border border-[#213145] rounded-full flex flex-col items-center justify-center p-1.5 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-vf-cyan">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </div>
             <div className="w-2.5 h-2.5 rounded-full bg-[#1A4CCC] absolute top-[-2px] right-[-2px] border-2 border-[#12151B]"></div>
          </div>
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2 text-[15px] tracking-wide">VinFast Assistant</h2>
            <p className="text-[12px] text-gray-500 font-medium tracking-wide">Smart Cockpit AI</p>
          </div>
        </div>
        <button 
          onClick={toggleListen}
          className={`text-gray-400 hover:text-white transition-colors p-2 rounded-full ${isListening ? 'animate-pulse text-[#00D2FF] bg-[#00D2FF]/10' : ''}`}
        >
            <Mic size={20} className="stroke-[1.5]" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-6 w-full">
        {chatHistory.map((m, i) => {
          
          if (m.type === 'tool_info') {
              return (
                 <div key={i} className="self-start text-[11px] font-mono text-gray-400 flex items-center gap-2 opacity-80 px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E3A008]"></div>
                    {m.content}
                 </div>
              );
          }
          
          return (
          <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-5 py-3.5 max-w-[85%] text-[14px] font-medium leading-[1.6] shadow-sm ${
              m.role === 'user' 
                ? 'bg-[#143B87] text-white rounded-[20px] rounded-br-md drop-shadow-[0_2px_8px_rgba(26,76,204,0.3)]' 
                : 'bg-[#1C2028] text-gray-300 border border-[#272D38] rounded-[20px] rounded-tl-md'
            }`}>
              {m.content}
            </div>
          </div>
        )})}
        {isAgentTyping && (
          <div className="flex w-full justify-start mt-2">
             <div className="px-5 py-3 rounded-[20px] rounded-tl-md bg-[#1C2028] border border-[#272D38] flex gap-1.5 items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-[#12151B] mt-2 mb-2">
        <div className="flex items-center gap-3 bg-[#161a20] p-1.5 rounded-full border border-[#272D38] focus-within:border-[#384152] transition-colors shadow-inner">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập yêu cầu..." 
            className="flex-1 bg-transparent text-gray-200 text-[14px] px-5 outline-none placeholder:text-[#4B5563]" 
          />
          
          <button 
            onClick={handleSend}
            disabled={!text.trim() || isAgentTyping}
            className="w-10 h-10 rounded-full bg-[#164e43] border border-[#1d6b5b] text-[#00D2FF] hover:bg-[#1a5e51] transition-colors disabled:opacity-50 disabled:grayscale flex items-center justify-center shrink-0"
          >
            <Send size={16} className="-ml-0.5 mt-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
