export type EffectiveStatus =
  | "Conectado"
  | "Leyendo"
  | "Desconectado"
  | "Inestable";

const INACTIVITY_WARN_MIN = 2;
const INACTIVITY_DOWN_MIN = 10;

type TimestampObj = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond?: number;
};

function tsToDate(ts?: TimestampObj): Date | null {
  if (!ts) return null;
  return new Date(
    ts.year,
    ts.month - 1,
    ts.day,
    ts.hour,
    ts.minute,
    ts.second,
    ts.millisecond || 0,
  );
}

function minutesDiff(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) / 60000;
}

function computeInactivityMinutes(term: any, now = new Date()): number {
  const byDelay =
    typeof term?.delayMinutes === "number" ? term.delayMinutes : 0;
  const last = tsToDate(term?.lastConnection);
  const byLast = last ? minutesDiff(now, last) : 0;
  return Math.max(byDelay, byLast);
}

function parseSerialFromMachineAndLocalIP(s?: string): number | null {
  if (!s) return null;
  const m = s.match(/_(\d+)\s*\(/);
  return m ? Number(m[1]) : null;
}

function findTerminalForDevice(device: any, terminals: any[]): any | null {
  if (!device.connectedToTCOD) return null;
  return terminals.find((t: any) => t.tcod === device.connectedToTCOD) || null;
}

export function computeEffectiveStatus(
  device: any,
  terminals: any[],
  now = new Date(),
): { effectiveStatus: EffectiveStatus; reason: string; isPrimary: boolean } {
  const rawStatus = (device.status || "").toLowerCase().trim();
  const text = (device.statusText || "").toLowerCase().trim();
  const term = findTerminalForDevice(device, terminals);

  if (!term) {
    return {
      effectiveStatus: "Desconectado",
      reason: "Sin terminal asociado (TCOD no encontrado)",
      isPrimary: false,
    };
  }

  const primarySerial = parseSerialFromMachineAndLocalIP(
    term.machineAndLocalIP,
  );
  const isPrimary =
    primarySerial != null && Number(device.serialNumber) === primarySerial;

  const inactivityMin = computeInactivityMinutes(term, now);

  if (!isPrimary) {
    return {
      effectiveStatus: "Desconectado",
      reason: "No es el device principal del terminal",
      isPrimary,
    };
  }

  if (inactivityMin >= INACTIVITY_DOWN_MIN) {
    return {
      effectiveStatus: "Desconectado",
      reason: `Sin actividad desde hace ${Math.round(inactivityMin)} min`,
      isPrimary,
    };
  }

  if (inactivityMin >= INACTIVITY_WARN_MIN) {
    if (rawStatus === "connected" || text.includes("desconectado")) {
      return {
        effectiveStatus: "Inestable",
        reason: `Actividad irregular (${Math.round(inactivityMin)} min)`,
        isPrimary,
      };
    }
  }

  if (text.includes("desconectado")) {
    return {
      effectiveStatus: "Inestable",
      reason: "Texto indica desconexión",
      isPrimary,
    };
  }

  if (text.includes("leyendo") || rawStatus === "reading") {
    return {
      effectiveStatus: "Leyendo",
      reason: "Dispositivo en lectura",
      isPrimary,
    };
  }

  return {
    effectiveStatus: "Conectado",
    reason: "Conexión y actividad recientes OK",
    isPrimary,
  };
}
