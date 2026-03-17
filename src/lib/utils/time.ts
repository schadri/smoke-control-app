import { differenceInMinutes, addMinutes, parse, format, isAfter, startOfDay, isBefore, differenceInDays } from 'date-fns';

export interface UserConfig {
  meta_diaria: number;
  hora_inicio: string; // 'HH:mm'
  hora_fin: string; // 'HH:mm'
  modo_reduccion_activa: boolean;
  precio_paquete: number;
  notificaciones_activas?: boolean;
}

export function timeStringToDate(timeStr: string, referenceDate: Date = new Date()): Date {
  return parse(timeStr, 'HH:mm', referenceDate);
}

/**
 * Obtiene la ventana operativa (inicio y fin) para el momento dado,
 * manejando correctamente el cruce de medianoche.
 */
export function getOperationalWindow(config: UserConfig, now: Date = new Date()) {
  const inicio = timeStringToDate(config.hora_inicio, now);
  let fin = timeStringToDate(config.hora_fin, now);

  // Caso normal: 09:00 a 22:00.
  // Caso medianoche: 09:00 a 02:00.
  if (isBefore(fin, inicio)) {
    fin = addMinutes(fin, 24 * 60); // Ajustar fin al día siguiente
  }

  // Si 'now' es antes de 'inicio', técnicamente todavía pertenecemos 
  // a la jornada operativa que empezó ayer (aunque el periodo de fumar haya terminado).
  if (isBefore(now, inicio)) {
    return {
      inicio: addMinutes(inicio, -24 * 60),
      fin: addMinutes(fin, -24 * 60),
      isNextDay: true
    };
  }

  return { 
    inicio, 
    fin,
    isNextDay: false
  };
}

/**
 * Calcula el intervalo ideal inicial (en minutos) para distribuir la meta diaria
 * a lo largo de las horas permitidas.
 */
export function calcularIntervaloInicial(config: UserConfig): number {
  const { inicio, fin } = getOperationalWindow(config);
  const minutosTotales = differenceInMinutes(fin, inicio);
  if (config.meta_diaria <= 1) return minutosTotales;
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
  const { fin } = getOperationalWindow(config, horaActual);

  const cigarrosRestantes = config.meta_diaria - logsDelDia;
  
  if (cigarrosRestantes <= 0) return 0; // Ya se alcanzó o superó la meta
  if (cigarrosRestantes === 1) return differenceInMinutes(fin, horaActual); // El último se fuma a la hora de fin idealmente

  const minutosRestantes = differenceInMinutes(fin, horaActual);
  const intervaloCalculado = Math.floor(Math.max(0, minutosRestantes) / cigarrosRestantes);

  // Si ya pasó la hora de fin (intervalo <= 0) pero aún quedan cigarrillos,
  // bloqueamos hasta el PRÓXIMO inicio de jornada.
  if (intervaloCalculado <= 0 && cigarrosRestantes > 0) {
    // Obtenemos la ventana para 'ahora'. Si estamos post-fin, el siguiente inicio 
    // es la hora de inicio del día natural siguiente a la ventana.
    const { inicio } = getOperationalWindow(config, horaActual);
    const proximoInicio = addMinutes(inicio, 24 * 60);
    return Math.max(0, differenceInMinutes(proximoInicio, horaActual));
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
