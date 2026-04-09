import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, Volume2, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveAPI } from '../hooks/useLiveAPI';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isToolCall?: boolean;
};

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý ảo VinFast. Tôi có thể giúp gì cho bạn hôm nay?',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isConnected, isSpeaking, transcript, connect, disconnect } = useLiveAPI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, transcript]);

  // Sync Live API transcript to messages
  useEffect(() => {
    if (transcript.length > 0) {
      const latest = transcript[transcript.length - 1];
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          role: latest.role as any,
          content: latest.text,
          isToolCall: latest.role === 'system'
        }
      ]);
    }
  }, [transcript]);

  const handleToggleVoice = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const lowerInput = newUserMsg.content.toLowerCase();
      let responseContent = '';
      let toolCallMsg: Message | null = null;

      if (lowerInput.includes('pin') || lowerInput.includes('battery')) {
        toolCallMsg = {
          id: Date.now().toString() + '-tool',
          role: 'system',
          content: 'Calling tool: get_battery_status()',
          isToolCall: true,
        };
        setMessages(prev => [...prev, toolCallMsg!]);
        
        const res = await fetch('/api/vehicle/battery');
        const data = await res.json();
        responseContent = data.message;

      } else if (lowerInput.includes('điều hoà') || lowerInput.includes('ac')) {
        toolCallMsg = {
          id: Date.now().toString() + '-tool',
          role: 'system',
          content: 'Calling tool: turn_on_ac()',
          isToolCall: true,
        };
        setMessages(prev => [...prev, toolCallMsg!]);

        const res = await fetch('/api/vehicle/ac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'turn_on', temp: 24 })
        });
        const data = await res.json();
        responseContent = data.message;

      } else if (lowerInput.includes('áp suất') || lowerInput.includes('lốp')) {
         toolCallMsg = {
          id: Date.now().toString() + '-tool',
          role: 'system',
          content: 'Calling tool: get_tire_pressure()',
          isToolCall: true,
        };
        setMessages(prev => [...prev, toolCallMsg!]);

        const res = await fetch('/api/vehicle/tire-pressure');
        const data = await res.json();
        responseContent = data.message;

      } else if (lowerInput.includes('trạm sạc') || lowerInput.includes('sạc')) {
        toolCallMsg = {
          id: Date.now().toString() + '-tool',
          role: 'system',
          content: 'Calling tool: find_charging_station()',
          isToolCall: true,
        };
        setMessages(prev => [...prev, toolCallMsg!]);

        const res = await fetch('/api/vehicle/charging-stations');
        const data = await res.json();
        responseContent = data.message;
        
      } else {
        responseContent = 'Tôi hiểu rồi. Tuy nhiên hiện tại tôi chỉ là phiên bản Demo, tôi có thể giúp bạn kiểm tra pin, áp suất lốp, tìm trạm sạc hoặc bật điều hoà.';
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-resp',
          role: 'assistant',
          content: responseContent,
        }
      ]);
    } catch (error) {
      console.error("Error calling backend API:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-error',
          role: 'assistant',
          content: 'Xin lỗi, tôi đang gặp sự cố kết nối với hệ thống xe.',
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-full bg-dashboard-card border border-dashboard-border rounded-3xl overflow-hidden relative shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-dashboard-border flex items-center justify-between bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-vinfast-blue/20 flex items-center justify-center border border-vinfast-blue/30 relative">
            <Sparkles className="text-vinfast-cyan" size={20} />
            <div className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-dashboard-card ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          </div>
          <div>
            <h2 className="font-medium text-lg">VinFast Assistant</h2>
            <p className="text-xs text-gray-400 font-mono">
              {isConnected ? (isSpeaking ? 'Đang nói...' : 'Đang nghe...') : 'Smart Cockpit AI'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleToggleVoice}
          className={`p-3 rounded-full transition-colors ${isConnected ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          {isConnected ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.isToolCall ? (
                <div className="bg-black/40 border border-dashboard-border rounded-lg px-4 py-2 flex items-center gap-2 text-xs font-mono text-gray-400 shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  {msg.content}
                </div>
              ) : (
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-vinfast-blue to-blue-800 text-white rounded-tr-sm' 
                    : 'bg-white/10 text-gray-100 rounded-tl-sm border border-white/5'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="flex justify-start"
            >
              <div className="bg-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 border border-white/5 shadow-lg">
                <motion.div 
                  className="w-2 h-2 bg-vinfast-cyan rounded-full" 
                  animate={{ y: [0, -5, 0] }} 
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} 
                />
                <motion.div 
                  className="w-2 h-2 bg-vinfast-cyan rounded-full" 
                  animate={{ y: [0, -5, 0] }} 
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} 
                />
                <motion.div 
                  className="w-2 h-2 bg-vinfast-cyan rounded-full" 
                  animate={{ y: [0, -5, 0] }} 
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dashboard-card border-t border-dashboard-border z-10 shrink-0">
        <div className="relative flex items-center group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isConnected ? "Đang kết nối giọng nói..." : "Nhập yêu cầu..."}
            disabled={isConnected}
            className="w-full bg-black/50 border border-dashboard-border rounded-full py-4 pl-6 pr-14 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vinfast-cyan/30 focus:border-vinfast-cyan/50 transition-all duration-300 disabled:opacity-50 shadow-inner"
          />
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputValue.trim() || isConnected}
            className="absolute right-2 p-3 bg-vinfast-cyan text-black rounded-full hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            <Send size={18} className="ml-0.5" />
          </motion.button>
        </div>
        
        {isConnected && (
          <div className="absolute bottom-full left-0 right-0 h-1 bg-gradient-to-r from-transparent via-vinfast-cyan to-transparent animate-pulse"></div>
        )}
      </div>
    </div>
  );
}
