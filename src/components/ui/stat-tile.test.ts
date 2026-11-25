import { describe, expect, it } from 'vitest';
import { splitFigures } from '@/components/ui/stat-tile';

const mono = (text: string) =>
  splitFigures(text)
    .filter((p) => p.figure)
    .map((p) => p.text);

describe('splitFigures', () => {
  it('pone en mono solo la cifra, la hora o la duración, no las palabras', () => {
    expect(mono('191 paraderos')).toEqual(['191']);
    expect(mono('12 estaciones')).toEqual(['12']);
    expect(mono('cada ~5 min')).toEqual(['~5 min']);
    expect(mono('05:48–21:48')).toEqual(['05:48–21:48']);
    expect(mono('2.239')).toEqual(['2.239']);
    expect(mono('3,2 km')).toEqual(['3,2 km']);
    expect(mono('Sin servicio')).toEqual([]);
    expect(mono('Últimos viajes')).toEqual([]);
  });

  it('no pierde texto', () => {
    for (const text of ['cada ~5 min', '191 paraderos', 'Sin servicio', '1 h 05 min', '']) {
      expect(splitFigures(text).map((p) => p.text).join('')).toBe(text);
    }
  });
});
