// CHANGEMENT ICI : On utilise "import * as chrono" car la version 2.x n'a plus d'export par défaut
import * as chrono from "chrono-node";
import { Chrono, Parser } from "chrono-node";
import { ORDINAL_NUMBER_PATTERN, parseOrdinalNumberPattern } from "./utils";

function getOrdinalDateParser() {
  return ({
    pattern: () => new RegExp(ORDINAL_NUMBER_PATTERN),
    extract: (_context: any, match: any) => {
      return {
        day: parseOrdinalNumberPattern(match[0]),
        month: window.moment().month(),
      };
    },
  } as Parser);
}

export default function getChronos(languages: string[]): Chrono[] {
  const locale = window.moment.locale();
  const isGB = locale === 'en-gb';

  const chronos: Chrono[] = [];
  const ordinalDateParser = getOrdinalDateParser();
  languages.forEach(l => {
    try {
      // @ts-ignore
      // On utilise (chrono as any) pour être sûr de pouvoir accéder aux langues dynamiquement
      const langModule = (chrono as any)[l];
      if (!langModule || !langModule.createCasualConfiguration) {
        console.warn(`Language ${l} is not supported by chrono-node`);
        return;
      }
      const c = new Chrono(langModule.createCasualConfiguration(isGB));
      c.parsers.push(ordinalDateParser);
      chronos.push(c);
    } catch (error) {
      console.error(`Failed to initialize chrono for language ${l}:`, error);
    }
  });
  
  // Si aucune langue n'a pu être initialisée, utiliser l'anglais par défaut
  if (chronos.length === 0) {
    try {
      const enModule = (chrono as any).en;
      if (enModule && enModule.createCasualConfiguration) {
        const c = new Chrono(enModule.createCasualConfiguration(isGB));
        c.parsers.push(ordinalDateParser);
        chronos.push(c);
      }
    } catch (error) {
      console.error('Failed to initialize default English chrono:', error);
    }
  }
  
  return chronos;
}