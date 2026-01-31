import { Locale, Dictionary } from './types';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import es from '@/locales/es.json';
import it from '@/locales/it.json';
import pt from '@/locales/pt.json';
import sv from '@/locales/sv.json';
import no from '@/locales/no.json';
import da from '@/locales/da.json';
import fi from '@/locales/fi.json';
import nl from '@/locales/nl.json';

const dictionaries: Record<Locale, Dictionary> = {
  en,
  fr,
  de,
  es,
  it,
  pt,
  sv,
  no,
  da,
  fi,
  nl,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
