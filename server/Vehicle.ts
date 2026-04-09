export class Vehicle {
  battery: number = 42;
  range: number = 120;
  tirePressure: number = 2.4;
  acOn: boolean = false;
  acTemp: number = 24;
  locked: boolean = true;
  lightsOn: boolean = false;

  getBatteryStatus() {
    return {
      batteryLevel: this.battery,
      estimatedRangeKm: this.range,
      status: "Charging"
    };
  }

  getTirePressure() {
    return {
      pressureBar: this.tirePressure,
      status: "Optimal"
    };
  }

  turnOnAc(temp?: number) {
    this.acOn = true;
    if (temp) {
      this.acTemp = temp;
    }
    return { success: true, temp: this.acTemp };
  }

  turnOffAc() {
    this.acOn = false;
    return { success: true };
  }

  lock() {
    this.locked = true;
    return { success: true };
  }

  unlock() {
    this.locked = false;
    return { success: true };
  }

  toggleLights(on: boolean) {
    this.lightsOn = on;
    return { success: true };
  }

  getState() {
    return {
      battery: this.battery,
      range: this.range,
      tirePressure: this.tirePressure,
      acOn: this.acOn,
      acTemp: this.acTemp,
      locked: this.locked,
      lightsOn: this.lightsOn
    };
  }
}

export const vehicle = new Vehicle();
