import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function useLiveAPI(onToolCall?: () => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const [userPrefs, setUserPrefs] = useState("");
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const playbackContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    fetch('/api/user-preferences')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content) {
          setUserPrefs(data.content);
        }
      })
      .catch(console.error);
  }, []);

  const playNext = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }
    
    isPlayingRef.current = true;
    setIsSpeaking(true);
    const buffer = audioQueueRef.current.shift()!;
    const source = playbackContextRef.current!.createBufferSource();
    source.buffer = buffer;
    source.connect(playbackContextRef.current!.destination);
    source.onended = playNext;
    source.start();
    currentSourceRef.current = source;
  }, []);

  const connect = useCallback(async () => {
    try {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `Bạn là trợ lý AI trên xe VinFast. Bạn nói chuyện thân thiện, ngắn gọn, hữu ích bằng tiếng Việt. Bạn có thể kiểm tra pin, áp suất lốp, tìm trạm sạc, bật điều hoà, khóa/mở khóa xe, bật/tắt đèn, xem thời tiết và mở ứng dụng giải trí.\n\nThông tin và sở thích của người dùng:\n${userPrefs}`,
          tools: [{
            functionDeclarations: [
              {
                name: "get_battery_status",
                description: "Return vehicle battery percentage and estimated range",
              },
              {
                name: "get_tire_pressure",
                description: "Return tire pressure status",
              },
              {
                name: "turn_on_ac",
                description: "Turn on AC",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    temp: { type: Type.NUMBER, description: "Temperature in Celsius" }
                  }
                }
              },
              {
                name: "find_charging_station",
                description: "Find nearest charging station",
              },
              { name: "get_weather", description: "Get current weather" },
              { name: "lock_vehicle", description: "Lock the vehicle" },
              { name: "unlock_vehicle", description: "Unlock the vehicle" },
              { name: "turn_on_lights", description: "Turn on vehicle lights" },
              { name: "turn_off_lights", description: "Turn off vehicle lights" },
              {
                name: "open_app",
                description: "Open an external app like YouTube",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    appName: { type: Type.STRING, description: "Name of the app to open" }
                  }
                }
              }
            ]
          }],
          inputAudioTranscription: { model: "models/gemini-3.1-flash-live-preview" },
          outputAudioTranscription: { model: "models/gemini-3.1-flash-live-preview" }
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              const buffer = new ArrayBuffer(pcm16.length * 2);
              const view = new DataView(buffer);
              for (let i = 0; i < pcm16.length; i++) {
                view.setInt16(i * 2, pcm16[i], true);
              }
              const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output from Gemini
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && playbackContextRef.current) {
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 0x7FFF;
              }
              const audioBuffer = playbackContextRef.current.createBuffer(1, float32.length, 24000);
              audioBuffer.getChannelData(0).set(float32);
              
              audioQueueRef.current.push(audioBuffer);
              if (!isPlayingRef.current) {
                playNext();
              }
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              if (currentSourceRef.current) {
                currentSourceRef.current.stop();
              }
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              setIsSpeaking(false);
            }

            // Handle Transcriptions
            if (message.serverContent?.modelTurn?.parts) {
              const textParts = message.serverContent.modelTurn.parts.filter(p => p.text);
              if (textParts.length > 0) {
                setTranscript(prev => [...prev, { role: 'assistant', text: textParts.map(p => p.text).join('') }]);
              }
            }

            // Handle Tool Calls
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls) {
                const functionResponses = [];
                for (const call of functionCalls) {
                  let result;
                  try {
                    if (call.name === 'get_battery_status') {
                      const res = await fetch('/api/vehicle/battery');
                      result = await res.json();
                    } else if (call.name === 'get_tire_pressure') {
                      const res = await fetch('/api/vehicle/tire-pressure');
                      result = await res.json();
                    } else if (call.name === 'turn_on_ac') {
                      const res = await fetch('/api/vehicle/ac', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'turn_on', temp: (call.args as any)?.temp || 24 })
                      });
                      result = await res.json();
                    } else if (call.name === 'find_charging_station') {
                      const res = await fetch('/api/vehicle/charging-stations');
                      result = await res.json();
                    } else if (call.name === 'get_weather') {
                      result = { weather: "Trời nắng đẹp, nhiệt độ 28 độ C." };
                    } else if (call.name === 'lock_vehicle') {
                      const res = await fetch('/api/vehicle/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'lock' })
                      });
                      result = await res.json();
                    } else if (call.name === 'unlock_vehicle') {
                      const res = await fetch('/api/vehicle/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'unlock' })
                      });
                      result = await res.json();
                    } else if (call.name === 'turn_on_lights') {
                      const res = await fetch('/api/vehicle/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'lights_on' })
                      });
                      result = await res.json();
                    } else if (call.name === 'turn_off_lights') {
                      const res = await fetch('/api/vehicle/control', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'lights_off' })
                      });
                      result = await res.json();
                    } else if (call.name === 'open_app') {
                      result = { message: `Đã mở ứng dụng ${(call.args as any)?.appName}.` };
                    }
                  } catch (e) {
                    result = { error: "Failed to execute tool" };
                  }
                  
                  functionResponses.push({
                    id: call.id,
                    name: call.name,
                    response: result
                  });
                  
                  setTranscript(prev => [...prev, { role: 'system', text: `Đang thực hiện: ${call.name}...` }]);
                }
                
                sessionPromise.then(session => {
                  session.sendToolResponse({ functionResponses });
                });
                
                if (onToolCall) {
                  onToolCall();
                }
              }
            }
          },
          onclose: () => {
            setIsConnected(false);
            cleanup();
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            setIsConnected(false);
            cleanup();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error("Failed to connect to Live API:", error);
      cleanup();
    }
  }, [playNext, userPrefs, onToolCall]);

  const cleanup = useCallback(() => {
    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    if (playbackContextRef.current && playbackContextRef.current.state !== 'closed') {
      playbackContextRef.current.close().catch(console.error);
    }
    if (sessionRef.current) {
      // The SDK doesn't have a direct close method on the session object yet, 
      // but we can let it garbage collect or handle it if available.
      if (typeof sessionRef.current.close === 'function') {
        sessionRef.current.close();
      }
    }
    
    setIsConnected(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isConnected,
    isSpeaking,
    transcript,
    connect,
    disconnect
  };
}
