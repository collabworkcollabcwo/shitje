import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'automjete',
    name: 'Automjete',
    icon: 'truck',
    color: '#E74C3C',
    subcategories: ['Makina', 'Motorë', 'Kamionë', 'Pjesë këmbimi', 'Biçikleta'],
  },
  {
    id: 'prona',
    name: 'Prona',
    icon: 'home',
    color: '#3498DB',
    subcategories: ['Apartamente', 'Shtëpi', 'Tokë', 'Lokale', 'Garazhe'],
  },
  {
    id: 'elektronike',
    name: 'Elektronikë',
    icon: 'monitor',
    color: '#9B59B6',
    subcategories: ['Telefona', 'Laptopë', 'Tableta', 'TV', 'Konsola', 'Aksesorë'],
  },
  {
    id: 'veshje',
    name: 'Veshje & Këpucë',
    icon: 'shopping-bag',
    color: '#E91E63',
    subcategories: ['Për meshkuj', 'Për femra', 'Për fëmijë', 'Këpucë', 'Aksesorë'],
  },
  {
    id: 'shtepi',
    name: 'Për Shtëpinë',
    icon: 'package',
    color: '#FF9800',
    subcategories: ['Mobilje', 'Pajisje kuzhine', 'Dekor', 'Kopsht', 'Vegla pune'],
  },
  {
    id: 'pune',
    name: 'Punë',
    icon: 'briefcase',
    color: '#2196F3',
    subcategories: ['Punë me kohë të plotë', 'Punë me kohë të pjesshme', 'Freelance', 'Praktikë'],
  },
  {
    id: 'sherbime',
    name: 'Shërbime',
    icon: 'tool',
    color: '#607D8B',
    subcategories: ['Riparime', 'Pastrim', 'Transport', 'Mësimdhënie', 'IT'],
  },
  {
    id: 'kafshe',
    name: 'Kafshë',
    icon: 'heart',
    color: '#4CAF50',
    subcategories: ['Qen', 'Mace', 'Zogj', 'Peshq', 'Aksesorë kafshësh'],
  },
  {
    id: 'sport',
    name: 'Sport & Hobi',
    icon: 'activity',
    color: '#00BCD4',
    subcategories: ['Pajisje sportive', 'Biçikleta', 'Kamping', 'Instrumente muzikore', 'Libra'],
  },
  {
    id: 'femije',
    name: 'Për Fëmijë',
    icon: 'smile',
    color: '#FF5722',
    subcategories: ['Lodra', 'Veshje fëmijësh', 'Karroca', 'Mobilje fëmijësh'],
  },
  {
    id: 'biznes',
    name: 'Biznes & Industri',
    icon: 'trending-up',
    color: '#795548',
    subcategories: ['Pajisje biznesi', 'Material ndërtimi', 'Bujqësi', 'Ushqimore'],
  },
  {
    id: 'te_tjera',
    name: 'Të Tjera',
    icon: 'grid',
    color: '#9E9E9E',
    subcategories: ['Bileta', 'Koleksione', 'Falas', 'Këmbim'],
  },
];

export const ALBANIAN_CITIES = [
  'Tiranë', 'Durrës', 'Vlorë', 'Elbasan', 'Shkodër',
  'Fier', 'Korçë', 'Berat', 'Lushnjë', 'Pogradec',
  'Kavajë', 'Laç', 'Gjirokastër', 'Sarandë', 'Kukës',
  'Lezhë', 'Peshkopi', 'Burrel', 'Librazhd', 'Përmet',
  'Tepelenë', 'Gramsh', 'Bulqizë', 'Ersekë', 'Krujë',
  'Koplik', 'Pukë', 'Bajzë', 'Rrogozhinë', 'Peqin',
];

export const CONDITION_LABELS: Record<string, string> = {
  'i_ri': 'I Ri',
  'si_i_ri': 'Si i Ri',
  'i_perdorur': 'I Përdorur',
  'per_pjese': 'Për Pjesë',
};
