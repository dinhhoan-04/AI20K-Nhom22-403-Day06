import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface VehicleState {
  battery: number;
  range: number;
  tirePressure: number;
  acOn: boolean;
  acTemp: number;
  locked: boolean;
  lightsOn: boolean;
}

interface VehicleContextType {
  state: VehicleState;
  refreshState: () => Promise<void>;
  updateControl: (action: string, payload?: any) => Promise<void>;
}

const defaultState: VehicleState = {
  battery: 0,
  range: 0,
  tirePressure: 0,
  acOn: false,
  acTemp: 24,
  locked: true,
  lightsOn: false
};

const VehicleContext = createContext<VehicleContextType>({
  state: defaultState,
  refreshState: async () => {},
  updateControl: async () => {}
});

export const useVehicle = () => useContext(VehicleContext);

export const VehicleProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<VehicleState>(defaultState);

  const refreshState = async () => {
    try {
      const res = await fetch('/api/vehicle/status');
      const data = await res.json();
      if (data.success) {
        setState(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch vehicle status:", error);
    }
  };

  const updateControl = async (action: string, payload?: any) => {
    try {
      let url = '/api/vehicle/control';
      let body: any = { action };

      if (action === 'turn_on_ac' || action === 'turn_off_ac') {
        url = '/api/vehicle/ac';
        body = { action: action === 'turn_on_ac' ? 'turn_on' : 'turn_off', ...payload };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success && data.state) {
        setState(data.state);
      }
    } catch (error) {
      console.error("Failed to update vehicle control:", error);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <VehicleContext.Provider value={{ state, refreshState, updateControl }}>
      {children}
    </VehicleContext.Provider>
  );
};
