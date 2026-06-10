import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DocSection {
  id: string;
  icon: string;
  color: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

const SECTIONS: DocSection[] = [
  {
    id: 'rreth',
    icon: 'info',
    color: '#FF6B00',
    title: 'Rreth Shitje',
    paragraphs: [
      'Shitje është tregu online i Shqipërisë — një vend ku çdokush mund të blejë dhe të shesë gjithçka: automjete, prona, elektronikë, veshje, mobilje dhe shumë më tepër.',
      'Publikimi i shpalljeve është falas. Aplikacioni funksionon në telefon (APK për Android) dhe në web, në çdo shfletues.',
    ],
  },
  {
    id: 'blej',
    icon: 'shopping-bag',
    color: '#2196F3',
    title: 'Si të blesh',
    paragraphs: ['Të blesh në Shitje është e thjeshtë:'],
    bullets: [
      'Kërko produktin te "Kërko" ose shfleto kategoritë — kërkimi kupton shqip ("makina", "shpi", "telefoni"…).',
      'Hap shpalljen për të parë fotot, çmimin, përshkrimin dhe vlerësimet e shitësit.',
      'Shto te shporta ❤️ artikujt që të pëlqejnë për t\'i krahasuar më vonë.',
      'Kontakto shitësin me "Shkruaj mesazh" (chat në aplikacion) ose "Telefono".',
      'Bini dakord për çmimin dhe vendin e takimit — pagesa bëhet dorazi, te takimi.',
    ],
  },
  {
    id: 'shit',
    icon: 'tag',
    color: '#4CAF50',
    title: 'Si të shesësh',
    paragraphs: ['Publiko një shpallje në më pak se një minutë:'],
    bullets: [
      'Hyr në llogarinë tënde (ose krijo një falas).',
      'Shtyp butonin portokalli "+" në mes të shiritit poshtë.',
      'Shto deri në 8 foto — shpalljet me foto reale shiten 3x më shpejt.',
      'Vendos titull të qartë, çmim të drejtë, kategori dhe qytetin.',
      'Pasi të shitet artikulli, shëno "E shitur" te shpallja jote — ose fshije.',
    ],
  },
  {
    id: 'llogaria',
    icon: 'user',
    color: '#9B59B6',
    title: 'Llogaria & Hyrja me Google',
    paragraphs: [
      'Mund të regjistrohesh me email dhe fjalëkalim, ose me një klikim përmes llogarisë tënde Google (në web).',
      'Llogaria të lejon të publikosh shpallje, t\'i menaxhosh ato (e shitur / fshirje), dhe mban emrin tënd te çdo shpallje që publikon.',
      'Të dhënat e llogarisë ruhen në pajisjen tënde (demo). Fjalëkalimet nuk ruhen kurrë si tekst i hapur.',
    ],
  },
  {
    id: 'monedha',
    icon: 'dollar-sign',
    color: '#00BCD4',
    title: 'Monedha & Tema',
    paragraphs: [
      'Çmimet shfaqen në Euro (€) si parazgjedhje. Prek etiketën e monedhës lart në Kryefaqe (ose te Cilësimet) për të kaluar në Lekë ose Dollarë — të gjitha çmimet konvertohen automatikisht.',
      'Tema e errët 🌙 aktivizohet nga ikona hënë/diell lart në Kryefaqe ose te Cilësimet. Zgjedhjet e tua ruhen automatikisht.',
    ],
  },
  {
    id: 'siguria',
    icon: 'shield',
    color: '#607D8B',
    title: 'Siguria & Privatësia',
    paragraphs: ['Për një përvojë të sigurt tregtimi, ndiq këto rregulla të arta:'],
    bullets: [
      'Takohu gjithmonë në vende publike me njerëz përreth (qendra tregtare, kafene).',
      'Verifiko artikullin para se të paguash — provo telefonin, ndiz makinën, kontrollo dokumentet.',
      'Mos paguaj kurrë paraprakisht për një artikull që s\'e ke parë.',
      'Kujdes nga çmimet shumë të ulëta — nëse duket tepër mirë për të qenë e vërtetë, zakonisht është mashtrim.',
      'Mos i jep askujt fjalëkalimin, kodet bankare apo të dhëna personale.',
      'Shitje nuk ndërmjetëson pagesa — çdo transaksion bëhet drejtpërdrejt mes blerësit dhe shitësit.',
    ],
  },
  {
    id: 'faq',
    icon: 'help-circle',
    color: '#E91E63',
    title: 'Pyetje të shpeshta (FAQ)',
    paragraphs: [],
    bullets: [
      'Sa kushton publikimi? — Asgjë, është 100% falas.',
      'Si i gjej shpalljet e mia? — Te Profili, pasi të kesh hyrë në llogari.',
      'Si e ndryshoj çmimin? — Fshi shpalljen dhe publikoje sërish me çmimin e ri (përditësimi po vjen së shpejti).',
      'Pse s\'po më shfaqet shpallja te kërkimi? — Shpalljet e shënuara "E shitur" fshihen nga kërkimi automatikisht.',
      'A funksionon në iPhone? — Po, hape në Safari — funksionon si aplikacion web.',
      'Si raportoj një mashtrim? — Na shkruaj te support@shitje.al me linkun e shpalljes.',
    ],
  },
  {
    id: 'zhvilluesit',
    icon: 'code',
    color: '#795548',
    title: 'Për zhvilluesit: Google Client ID',
    paragraphs: [
      'Butoni "Vazhdo me Google" punon në modalitet demo derisa të konfigurohet një Google OAuth Client ID real. Hapat:',
    ],
    bullets: [
      '1. Hap console.cloud.google.com → krijo një projekt → "APIs & Services" → "Credentials".',
      '2. "Create Credentials" → "OAuth client ID" → lloji "Web application".',
      '3. Te "Authorized JavaScript origins" shto: https://collabworkcollabcwo.github.io',
      '4. Kopjo Client ID-në (mbaron me .apps.googleusercontent.com).',
      '5. Në GitHub: repo → Settings → Secrets and variables → Actions → Variables → shto GOOGLE_CLIENT_ID me vlerën e kopjuar.',
      '6. Bëj një push (ose rinis deploy-in) — butoni Google bëhet automatikisht real.',
    ],
  },
  {
    id: 'kontakt',
    icon: 'mail',
    color: '#3498DB',
    title: 'Kontakt',
    paragraphs: [
      'Për çdo pyetje, problem teknik apo raportim: support@shitje.al',
      'Versioni: Shitje v1.1.0 · Tregu i Shqipërisë 🇦🇱',
    ],
  },
];

export default function DocsScreen() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [open, setOpen] = useState<string[]>(section ? [String(section)] : ['rreth']);

  useEffect(() => {
    if (section) setOpen(prev => (prev.includes(String(section)) ? prev : [...prev, String(section)]));
  }, [section]);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, paddingBottom: 30 }}>
      <View style={styles.headerCard}>
        <View style={styles.headerIcon}>
          <Feather name="book-open" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.headerTitle}>Dokumentacioni</Text>
        <Text style={styles.headerSubtitle}>
          Gjithçka që duhet të dish për të blerë e shitur me siguri në Shitje.
        </Text>
      </View>

      {SECTIONS.map(s => {
        const isOpen = open.includes(s.id);
        return (
          <View key={s.id} style={[styles.section, isOpen && styles.sectionOpen]}>
            <Pressable style={styles.sectionHeader} onPress={() => toggle(s.id)}>
              <View style={[styles.sectionIcon, { backgroundColor: s.color + '1E' }]}>
                <Feather name={s.icon as any} size={17} color={s.color} />
              </View>
              <Text style={styles.sectionTitle}>{s.title}</Text>
              <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.gray[400]} />
            </Pressable>
            {isOpen && (
              <View style={styles.sectionBody}>
                {s.paragraphs.map((p, i) => (
                  <Text key={i} style={styles.paragraph}>{p}</Text>
                ))}
                {s.bullets?.map((b, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: s.color }]} />
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerCard: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 7,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 4,
    lineHeight: 19,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    overflow: 'hidden',
  },
  sectionOpen: {
    borderColor: Colors.gray[200],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: -0.2,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 9,
  },
  paragraph: {
    fontSize: 13.5,
    color: Colors.gray[600],
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5,
    color: Colors.gray[600],
    lineHeight: 20,
  },
});
