import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import type { RouteSchedule } from '../../src/types/transport.ts';
import {
  compareStopServiceWindows,
  encodeScheduleDays,
  renderScheduleModule,
  renderStopServicesModule,
  type StopServiceWindow,
} from './gtfs-encode.ts';

const dir = mkdtempSync(join(tmpdir(), 'gtfs-encode-test-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

// Importa el módulo tal como quedaría en src/data para probar el decodificador real.
async function importRendered<T>(name: string, source: string): Promise<T> {
  const path = join(dir, `${name}.ts`);
  writeFileSync(path, source);
  return (await import(/* @vite-ignore */ pathToFileURL(path).href)) as T;
}

const weekday: RouteSchedule[number] = [
  [360, 64],
  [380, 64],
  [400, 66],
];
const directionSchedules = new Map<string, RouteSchedule>([
  ['gtfs-route-837#0', [weekday, weekday, weekday, weekday, weekday, [[420, 60]], []]],
  ['gtfs-route-837#1', [[[365, 70]], [[365, 70]], [[365, 70]], [[365, 70]], [[365, 70]], [], [[1500, 30]]]],
  ['gtfs-route-949#0', [[], [], [], [], [], [], [[300, 90]]]],
]);

describe('horarios', () => {
  it('guarda salidas como diferencias y los días repetidos como índice', () => {
    expect(encodeScheduleDays(directionSchedules.get('gtfs-route-837#0')!)).toBe(
      '[[360,64,20,64,20,66],0,0,0,0,[420,60],[]]',
    );
    expect(encodeScheduleDays(directionSchedules.get('gtfs-route-949#0')!)).toBe('[[],0,0,0,0,0,[300,90]]');
  });

  it('el módulo generado reconstruye ambos sentidos y la ruta combinada', async () => {
    const mod = await importRendered<{
      ROUTE_DIRECTION_SCHEDULES: Record<string, RouteSchedule>;
      ROUTE_SCHEDULES: Record<string, RouteSchedule>;
      SCHEDULE_META: { routes: number };
    }>(
      'schedule',
      renderScheduleModule({ banner: '// test', directionSchedules, meta: { routes: 2 } }),
    );
    expect(mod.ROUTE_DIRECTION_SCHEDULES).toEqual(Object.fromEntries(directionSchedules));
    expect(mod.ROUTE_SCHEDULES['gtfs-route-837']).toEqual([
      [[360, 64], [365, 70], [380, 64], [400, 66]],
      [[360, 64], [365, 70], [380, 64], [400, 66]],
      [[360, 64], [365, 70], [380, 64], [400, 66]],
      [[360, 64], [365, 70], [380, 64], [400, 66]],
      [[360, 64], [365, 70], [380, 64], [400, 66]],
      [[420, 60]],
      [[1500, 30]],
    ]);
    expect(mod.ROUTE_SCHEDULES['gtfs-route-949']).toEqual([[], [], [], [], [], [], [[300, 90]]]);
    expect(Object.keys(mod.ROUTE_SCHEDULES)).toEqual(['gtfs-route-837', 'gtfs-route-949']);
    expect(mod.SCHEDULE_META.routes).toBe(2);
  });
});

describe('ventanas por paradero', () => {
  it('el módulo generado devuelve las mismas tuplas, en orden canónico', async () => {
    const weekdays = [0, 1, 2, 3, 4];
    const windows: StopServiceWindow[] = [
      ...weekdays.map((day): StopServiceWindow => ['gtfs-route-837', 'Vía Láctea 10P - Leonera', day, 411, 1467, 6, 160]),
      ...weekdays.map((day): StopServiceWindow => ['gtfs-route-1044', 'Concepción', day, 423, 1300, 5, 176]),
      ['gtfs-route-837', 'Vía Láctea 10P - Leonera', 5, 411, 1482, 6, 144],
      ['gtfs-route-1044', 'Concepción', 6, 500, 1200, 10, 71],
    ];
    const windowsByStop = new Map<string, StopServiceWindow[]>([
      ['gtfs-stop-49344', [...windows].reverse()],
      ['gtfs-stop-20151', [['gtfs-route-949', '201 - "Santa" Juana', 6, 300, 300, 0, 1]]],
    ]);
    const mod = await importRendered<{
      STOP_SERVICE_WINDOWS: Record<string, StopServiceWindow[]>;
      STOP_SERVICE_WINDOWS_META: { windows: number };
    }>(
      'services',
      renderStopServicesModule({ banner: '// test', windowsByStop, meta: { windows: 13 } }),
    );
    expect(mod.STOP_SERVICE_WINDOWS['gtfs-stop-49344']).toEqual([...windows].sort(compareStopServiceWindows));
    expect(mod.STOP_SERVICE_WINDOWS['gtfs-stop-20151']).toEqual([
      ['gtfs-route-949', '201 - "Santa" Juana', 6, 300, 300, 0, 1],
    ]);
    expect(Object.keys(mod.STOP_SERVICE_WINDOWS)).toEqual(['gtfs-stop-20151', 'gtfs-stop-49344']);
    expect(mod.STOP_SERVICE_WINDOWS_META.windows).toBe(13);
  });
});
