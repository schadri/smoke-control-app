import { differenceInMinutes, addMinutes, parse, format, isAfter, startOfDay, isBefore, differenceInDays } from 'date-fns';

export interface UserConfig {
  meta_diaria: number;
  hora_inicio: string; // 'HH:mm'
  hora_fin: string; // 'HH:mm'
  modo_reduccion_activa: boolean;
  precio_paquete: number;
  notificaciones_activas?: boolean;
}

/**
 * Convierte un string de hora 'HH:mm' a un objeto Date usando el día actual.
 */
export function timeStringToDate(timeStr: string, referenceDate: Date = new Date()): Date {
  return parse(timeStr, 'HH:mm', referenceDate);
}

/**
 * Calcula el intervalo ideal inicial (en minutos) para distribuir la meta diaria
 * a lo largo de las horas permitidas.
 */
export function calcularIntervaloInicial(config: UserConfig): number {
  const inicio = timeStringToDate(config.hora_inicio);
  let fin = timeStringToDate(config.hora_fin);

  // Si la hora de fin es menor a la de inicio, asumimos que cruza la medianoche (ej. 23:00 a 02:00)
  if (isBefore(fin, inicio)) {
    fin = addMinutes(fin, 24 * 60);
  }

  const minutosTotales = differenceInMinutes(fin, inicio);
  if (config.meta_diaria <= 1) return minutosTotales; // Evita división por cero
  
  // Dividimos el tiempo disponible entre los "espacios" entre cigarrillos (meta - 1)
  return Math.floor(minutosTotales / (config.meta_diaria - 1));
}

/**
 * Recalcula el intervalo restante tras registrar un consumo (emergencia o normal).
 * @param horaActual Momento del consumo
 * @param logsDelDia Cantidad de cigarrillos YA consumidos HOY (incluyendo el actual recién registrado)
 * @param config Configuración del usuario
 * @returns Nuevo intervalo en minutos
 */
export function calcularIntervaloRestante(horaActual: Date, logsDelDia: number, config: UserConfig): number {
  let fin = timeStringToDate(config.hora_fin, horaActual);
  const inicio = timeStringToDate(config.hora_inicio, horaActual);

  // Ajuste simple si cruza la medianoche
  if (isBefore(fin, inicio)) {
    fin = addMinutes(fin, 24 * 60);
    // Si la hora actual es antes del inicio (ej 01:00 am) y cruza medianoche, acomodamos fin
    if (isBefore(horaActual, inicio)) {
        fin = timeStringToDate(config.hora_fin, horaActual);
    }
  }

  const cigarrosRestantes = config.meta_diaria - logsDelDia;
  
  if (cigarrosRestantes <= 0) return 0; // Ya se alcanzó o superó la meta
  if (cigarrosRestantes === 1) return differenceInMinutes(fin, horaActual); // El último se fuma a la hora de fin idealmente

  const minutosRestantes = differenceInMinutes(fin, horaActual);
  const intervaloCalculado = Math.floor(Math.max(0, minutosRestantes) / cigarrosRestantes);

  // Si ya pasó la hora de fin (intervalo <= 0) pero aún quedan cigarrillos,
  // bloqueamos hasta la hora de inicio del día siguiente.
  if (intervaloCalculado <= 0 && cigarrosRestantes > 0) {
    const inicioManana = addMinutes(timeStringToDate(config.hora_inicio, horaActual), 24 * 60);
    return differenceInMinutes(inicioManana, horaActual);
  }
  
  return intervaloCalculado;
}

/**
 * Verifica si es necesario reducir la meta diaria basada en los días activos.
 * Resta 1 cigarrillo cada 7 días.
 */
export function verificarReduccionSemanal(perfilCreatedAt: string, config: UserConfig): number {
  if (!config.modo_reduccion_activa) return config.meta_diaria;

  const diasActivo = differenceInDays(new Date(), new Date(perfilCreatedAt));
  const reducciones = Math.floor(diasActivo / 7);
  
  return Math.max(1, config.meta_diaria - reducciones); // Nunca baja de 1
}
