/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dashboard from './components/Dashboard';
import { VehicleProvider } from './context/VehicleContext';

export default function App() {
  return (
    <VehicleProvider>
      <Dashboard />
    </VehicleProvider>
  );
}
