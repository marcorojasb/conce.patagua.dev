import { describe, expect, it } from 'vitest';
import { estimateTooltipLine, gpsTooltipLine, simulationVehicleLabels } from '@/lib/vehicle-labels';
import type { Route, RouteDirection } from '@/types/transport';

function direction(directionId: 0 | 1, variant: string | undefined, destination: string | undefined): RouteDirection {
  return { directionId, headsign: `Vía ${variant ?? ''} ${destination ?? 'Sin destino'}`, variant, destination, path: [], stops: [] };
}

const R24MF = {
  id: 'gtfs-route-800',
  code: '24MF',
  directions: [direction(0, '24M', 'Lomas de San Andrés'), direction(1, '24F', 'Hualpén')],
} as unknown as Route;
const R401 = {
  id: 'gtfs-route-835',
  code: '401',
  directions: [direction(0, undefined, 'Tomé'), direction(1, undefined, undefined)],
} as unknown as Route;
const L1 = { id: 'bt-l1', code: 'L1' } as unknown as Route;

describe('textos del tooltip de una micro', () => {
  it('GPS: letrero, destino, edad y patente', () => {
    expect(gpsTooltipLine({ code: '24F', destination: 'Hualpén', ageMs: 20_000, plate: 'PRUE51' })).toBe(
      '24F hacia Hualpén · GPS hace 20 s · patente PRUE51',
    );
    expect(gpsTooltipLine({ code: '24F', destination: 'Hualpén', ageMs: 4 * 60_000, plate: null })).toBe(
      '24F hacia Hualpén · GPS hace 4 min',
    );
    expect(gpsTooltipLine({ code: '401', destination: null, ageMs: 3_000, plate: null })).toBe('401 · GPS recién');
    // Sin hora del GPS no se inventa una edad.
    expect(gpsTooltipLine({ code: '401', destination: 'Tomé', ageMs: null, plate: 'PRUE58' })).toBe(
      '401 hacia Tomé · GPS · patente PRUE58',
    );
    // Su viaje todavía no sale de la cabecera.
    expect(
      gpsTooltipLine({ code: '201', destination: 'Concepción', ageMs: 10_000, plate: null, departsAt: '19:00' }),
    ).toBe('201 hacia Concepción · aún no sale (sale 19:00) · GPS hace 10 s');
  });

  it('estimada: siempre dice que es según el programa, nunca GPS', () => {
    expect(estimateTooltipLine('24F', 'Hualpén')).toBe('24F hacia Hualpén · estimado según el programa');
    expect(estimateTooltipLine('L1', null)).toBe('L1 · estimado según el programa');
    expect(estimateTooltipLine('24F', 'Hualpén')).not.toMatch(/GPS/);
  });
});

describe('simulationVehicleLabels', () => {
  it('GTFS por "<routeId>#<sentido>" con el letrero del sentido; sin letrero, el código de la línea', () => {
    const labels = simulationVehicleLabels([R24MF, R401]);
    expect(labels.get('gtfs-route-800#0')).toEqual({ code: '24M', destination: 'Lomas de San Andrés' });
    expect(labels.get('gtfs-route-800#1')).toEqual({ code: '24F', destination: 'Hualpén' });
    expect(labels.get('gtfs-route-835#0')).toEqual({ code: '401', destination: 'Tomé' });
    // Sin destino corto queda el letrero completo.
    expect(labels.get('gtfs-route-835#1')).toEqual({ code: '401', destination: 'Vía  Sin destino' });
  });

  it('Biotrén por id de patrón, con el destino de "Origen → Destino"', () => {
    const labels = simulationVehicleLabels([L1]);
    expect(labels.get('bt-l1-hualqui-mercado-weekday')).toEqual({ code: 'L1', destination: 'Mercado Talcahuano' });
    // Patrones de líneas que no se pasan no tienen letrero.
    expect([...labels.keys()].every((key) => key.startsWith('bt-l1'))).toBe(true);
  });
});
