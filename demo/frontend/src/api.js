import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = {
  // Chat
  chat: async (message) => {
    const res = await axios.post(`${API_URL}/chat`, { message });
    return res.data;
  },
  // State Sync
  getCarState: async () => {
    const res = await axios.get(`${API_URL}/car/state`);
    return res.data;
  },
  // Manual Controls
  toggleAC: async (isOn) => {
    await axios.post(`${API_URL}/car/ac/${isOn ? 'on' : 'off'}`);
  },
  setACTemperature: async (temp) => {
    await axios.post(`${API_URL}/car/ac/set-temperature`, { temperature: temp });
  },
  mockTiresUpdate: async (tiresData) => {
    await axios.post(`${API_URL}/car/tires/mock-update`, tiresData);
  },
  toggleLights: async (isOn) => {
    await axios.post(`${API_URL}/car/lights/${isOn ? 'on' : 'off'}`);
  },
  toggleDoors: async (isLocked) => {
    await axios.post(`${API_URL}/car/doors/${isLocked ? 'lock' : 'unlock'}`);
  }
};
