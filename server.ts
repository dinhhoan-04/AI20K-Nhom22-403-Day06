import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Vehicle State
  let vehicleState = {
    battery: 42,
    range: 120,
    tirePressure: 2.4,
    acOn: false,
    acTemp: 24,
    locked: true,
    lightsOn: false
  };

  // --- VEHICLE APIs (Tool Mock) ---

  // 1. Get Battery Status
  app.get('/api/vehicle/battery', (req, res) => {
    res.json({
      success: true,
      data: {
        batteryLevel: vehicleState.battery,
        estimatedRangeKm: vehicleState.range,
        status: "Charging"
      },
      message: `Pin còn ${vehicleState.battery}%`
    });
  });

  // 2. Get Tire Pressure
  app.get('/api/vehicle/tire-pressure', (req, res) => {
    res.json({
      success: true,
      data: {
        pressureBar: vehicleState.tirePressure,
        status: "Optimal"
      },
      message: "Áp suất lốp ổn định"
    });
  });

  // 3. Turn on AC
  app.post('/api/vehicle/ac', (req, res) => {
    const { action, temp } = req.body;
    
    if (action === 'turn_on') {
      vehicleState.acOn = true;
      if (temp) vehicleState.acTemp = temp;
      res.json({ 
        success: true, 
        message: `Đã bật điều hoà ở mức ${vehicleState.acTemp} độ`,
        state: vehicleState 
      });
    } else if (action === 'turn_off') {
      vehicleState.acOn = false;
      res.json({ 
        success: true, 
        message: 'Đã tắt điều hoà',
        state: vehicleState 
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid action' });
    }
  });

  // 4. Find Charging Station
  app.get('/api/vehicle/charging-stations', (req, res) => {
    res.json({ 
      success: true, 
      message: "Tôi chưa hỗ trợ tính năng này"
    });
  });

  // General Status Endpoint (for UI updates)
  app.get('/api/vehicle/status', (req, res) => {
    res.json({ success: true, data: vehicleState });
  });

  // General Control Endpoint (for UI updates)
  app.post('/api/vehicle/control', (req, res) => {
    const { action } = req.body;
    if (action === 'lock') vehicleState.locked = true;
    if (action === 'unlock') vehicleState.locked = false;
    if (action === 'lights_on') vehicleState.lightsOn = true;
    if (action === 'lights_off') vehicleState.lightsOn = false;
    
    res.json({ success: true, state: vehicleState });
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
