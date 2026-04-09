import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { vehicle } from './server/Vehicle';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- USER PREFERENCES API ---
  app.get('/api/user-preferences', (req, res) => {
    try {
      const prefsPath = path.join(process.cwd(), 'user_preferences.md');
      if (fs.existsSync(prefsPath)) {
        const content = fs.readFileSync(prefsPath, 'utf-8');
        res.json({ success: true, content });
      } else {
        res.json({ success: true, content: "" });
      }
    } catch (error) {
      res.json({ success: false, content: "" });
    }
  });

  // --- VEHICLE APIs (Tool Mock) ---
  // 1. Get Battery Status
  app.get('/api/vehicle/battery', (req, res) => {
    res.json({
      success: true,
      data: vehicle.getBatteryStatus(),
      message: `Pin còn ${vehicle.battery}%`
    });
  });

  // 2. Get Tire Pressure
  app.get('/api/vehicle/tire-pressure', (req, res) => {
    res.json({
      success: true,
      data: vehicle.getTirePressure(),
      message: "Áp suất lốp ổn định"
    });
  });

  // 3. Turn on AC
  app.post('/api/vehicle/ac', (req, res) => {
    const { action, temp } = req.body;
    
    if (action === 'turn_on') {
      vehicle.turnOnAc(temp);
      res.json({ 
        success: true, 
        message: `Đã bật điều hoà ở mức ${vehicle.acTemp} độ`,
        state: vehicle.getState() 
      });
    } else if (action === 'turn_off') {
      vehicle.turnOffAc();
      res.json({ 
        success: true, 
        message: 'Đã tắt điều hoà',
        state: vehicle.getState() 
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid action' });
    }
  });

  // 4. Find Charging Station
  app.get('/api/vehicle/charging-stations', (req, res) => {
    res.json({ 
      success: true, 
      message: "Trạm sạc VinFast gần nhất cách đây 3.2km (Landmark 81)."
    });
  });

  // General Status Endpoint (for UI updates)
  app.get('/api/vehicle/status', (req, res) => {
    res.json({ success: true, data: vehicle.getState() });
  });

  // General Control Endpoint (for UI updates)
  app.post('/api/vehicle/control', (req, res) => {
    const { action } = req.body;
    if (action === 'lock') vehicle.lock();
    if (action === 'unlock') vehicle.unlock();
    if (action === 'lights_on') vehicle.toggleLights(true);
    if (action === 'lights_off') vehicle.toggleLights(false);
    
    res.json({ success: true, state: vehicle.getState() });
  });

  // --- GEMINI AGENT API (For Text Chat) ---
  app.post('/api/chat', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ 
          response: "Vui lòng cấu hình GEMINI_API_KEY trong Settings -> Secrets.",
          toolCalls: []
        });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const tools = [{
        functionDeclarations: [
          { name: "get_battery_status", description: "Lấy phần trăm pin và quãng đường dự kiến của xe." },
          { name: "get_tire_pressure", description: "Lấy thông tin áp suất lốp xe." },
          {
            name: "turn_on_ac",
            description: "Bật điều hoà trên xe.",
            parameters: {
              type: Type.OBJECT,
              properties: { temp: { type: Type.NUMBER, description: "Nhiệt độ mong muốn (độ C)" } }
            }
          },
          { name: "find_charging_station", description: "Tìm trạm sạc xe điện gần nhất." },
          { name: "get_weather", description: "Lấy thông tin thời tiết hiện tại." },
          { name: "lock_vehicle", description: "Khóa cửa xe." },
          { name: "unlock_vehicle", description: "Mở khóa cửa xe." },
          { name: "turn_on_lights", description: "Bật đèn xe." },
          { name: "turn_off_lights", description: "Tắt đèn xe." },
          {
            name: "open_app",
            description: "Mở một ứng dụng giải trí trên xe (ví dụ: YouTube, Spotify).",
            parameters: {
              type: Type.OBJECT,
              properties: { appName: { type: Type.STRING, description: "Tên ứng dụng cần mở" } }
            }
          }
        ]
      }];

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `Bạn là trợ lý AI trên xe VinFast. Bạn nói chuyện thân thiện, ngắn gọn, hữu ích bằng tiếng Việt. Bạn có thể kiểm tra pin, áp suất lốp, tìm trạm sạc, bật điều hoà, khóa/mở khóa xe, bật/tắt đèn, xem thời tiết và mở ứng dụng giải trí. Nếu người dùng yêu cầu thao tác, hãy gọi tool tương ứng.\n\nThông tin và sở thích của người dùng:\n${fs.existsSync(path.join(process.cwd(), 'user_preferences.md')) ? fs.readFileSync(path.join(process.cwd(), 'user_preferences.md'), 'utf-8') : ''}`,
          tools: tools,
          temperature: 0.2
        }
      });

      let response = await chat.sendMessage({ message });
      let toolCalls: string[] = [];

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          toolCalls.push(call.name);
          let result;
          
          if (call.name === 'get_battery_status') {
             result = vehicle.getBatteryStatus();
          } else if (call.name === 'get_tire_pressure') {
             result = vehicle.getTirePressure();
          } else if (call.name === 'turn_on_ac') {
             result = vehicle.turnOnAc(call.args?.temp as number);
          } else if (call.name === 'find_charging_station') {
             result = { message: "Trạm sạc VinFast gần nhất cách đây 3.2km (Landmark 81)." };
          } else if (call.name === 'get_weather') {
             result = { weather: "Trời nắng đẹp, nhiệt độ 28 độ C." };
          } else if (call.name === 'lock_vehicle') {
             result = vehicle.lock();
          } else if (call.name === 'unlock_vehicle') {
             result = vehicle.unlock();
          } else if (call.name === 'turn_on_lights') {
             result = vehicle.toggleLights(true);
          } else if (call.name === 'turn_off_lights') {
             result = vehicle.toggleLights(false);
          } else if (call.name === 'open_app') {
             result = { message: `Đã mở ứng dụng ${call.args?.appName}.` };
          }

          response = await chat.sendMessage({
            message: [{
              functionResponse: {
                name: call.name,
                response: result
              }
            }]
          });
        }
      }

      res.json({ 
        response: response.text,
        toolCalls: toolCalls
      });
    } catch (error: any) {
      console.error("Agent Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
