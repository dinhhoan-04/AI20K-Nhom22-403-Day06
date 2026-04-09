import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
    <div className="flex flex-col h-full bg-dashboard-card border border-dashboard-border rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-dashboard-border flex items-center justify-between bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-vinfast-blue/20 flex items-center justify-center border border-vinfast-blue/30 relative">
            <Sparkles className="text-vinfast-cyan" size={20} />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dashboard-card"></div>
          </div>
          <div>
            <h2 className="font-medium text-lg">VinFast Assistant</h2>
            <p className="text-xs text-gray-400 font-mono">Smart Cockpit AI</p>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
          <Volume2 size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.isToolCall ? (
                <div className="bg-black/40 border border-dashboard-border rounded-lg px-4 py-2 flex items-center gap-2 text-xs font-mono text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  {msg.content}
                </div>
              ) : (
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-vinfast-blue text-white rounded-tr-sm' 
                    : 'bg-white/10 text-gray-100 rounded-tl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dashboard-card border-t border-dashboard-border z-10">
        <div className="relative flex items-center">
          <button 
            onClick={() => setIsListening(!isListening)}
            className={`absolute left-2 p-3 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500/20 text-red-500 animate-pulse' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Mic size={20} />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nói 'VinFast ơi' hoặc nhập yêu cầu..."
            className="w-full bg-black/50 border border-dashboard-border rounded-full py-4 pl-14 pr-14 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-vinfast-cyan/50 transition-colors"
          />
          
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="absolute right-2 p-3 bg-vinfast-cyan text-black rounded-full hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
        
        {isListening && (
          <div className="absolute bottom-full left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
        )}
      </div>
    </div>
  );
}
