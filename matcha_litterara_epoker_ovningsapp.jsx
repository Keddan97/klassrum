import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, HelpCircle, TimerReset } from "lucide-react";

// \n// Matcha litterära epoker – övningsapp för vuxenutbildningen (Svenska)\n// En enkel, responsiv, tillgänglig övning där elever matchar epok med kännetecken.\n// Byggd för en lektion där kursmålet "En översikt över de litterära epokerna" tränas.\n//\n
// --- Databas över epoker och möjliga kännetecken ---
const ERA_BANK = [
  {
    id: "antiken",
    name: "Antiken",
    hints: [
      "Epos, tragedi och komedi; mytologi och hjälteideal",
      "Muntlig tradition; hexameter och episka hjältar",
      "Centrala namn: Homeros, Sofokles, Euripides",
      "Ca 800 f.Kr.–500 e.Kr. i Medelhavsområdet",
    ],
  },
  {
    id: "medeltiden",
    name: "Medeltiden",
    hints: [
      "Religiös, teocentrisk världsbild; allegorier och helgonlegender",
      "Riddarideal och hövisk kärlek; epos som \"Rolandssången\"",
      "Centralt namn: Dante Alighieri",
      "Ca 500–1400; latinet dominerar lärd kultur",
    ],
  },
  {
    id: "renassansen",
    name: "Renässansen",
    hints: [
      "Antikens \"återfödelse\"; humanism och individens värde",
      "Experimentlust i dramat och romanens födelse",
      "Centrala namn: Shakespeare, Cervantes",
      "Ca 1500–1600; upptäckter och vetenskaplig nyfikenhet",
    ],
  },
  {
    id: "upplysningen",
    name: "Upplysningen",
    hints: [
      "Förnuftstro, rationalism och samhällskritik",
      "Satir och essä; encyklopedisk kunskapstro",
      "Centrala namn: Voltaire, Swift, Defoe",
      "1700-talet; idéer om frihet och rättigheter",
    ],
  },
  {
    id: "romantiken",
    name: "Romantiken",
    hints: [
      "Känsla, fantasi och naturmystik; genikult",
      "Intresse för det övernaturliga och det historiska",
      "Centrala namn: Goethe, Mary Shelley, Almqvist",
      "Sent 1700–tidigt 1800-tal; nationalismens framväxt",
    ],
  },
  {
    id: "realismen",
    name: "Realismen",
    hints: [
      "Vardagliga miljöer; samhällsskildring och socialt patos",
      "Allvetande berättare; kritisk blick på samtiden",
      "Centrala namn: Flaubert, Dickens, Balzac",
      "Mitten–slutet av 1800-talet",
    ],
  },
  {
    id: "naturalismen",
    name: "Naturalismen",
    hints: [
      "Determinism: arv och miljö; \"vetenskaplig\" objektivitet",
      "Detaljerad miljö- och människoskildring; miljöstudier",
      "Centrala namn: Émile Zola, (tidige) Strindberg",
      "Senare delen av 1800-talet",
    ],
  },
  {
    id: "modernismen",
    name: "Modernismen",
    hints: [
      "Brytning med tradition; formexperiment och fragment",
      "Inre monolog, flöde av medvetande; collage",
      "Centrala namn: Kafka, Joyce, Eliot, Edith Södergran",
      "Tidigt 1900-tal; urbanisering, teknik och krigserfarenheter",
    ],
  },
] as const;

type EraId = typeof ERA_BANK[number]["id"];

// Välj exakt en slumpad hint per epok per omgång
function buildRoundPairs(eras: typeof ERA_BANK) {
  return eras.map((era) => {
    const hint = era.hints[Math.floor(Math.random() * era.hints.length)];
    return { eraId: era.id as EraId, hint };
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function EpokMatchApp() {
  const [round, setRound] = useState(1);
  const [selectedEra, setSelectedEra] = useState<EraId | null>(null);
  const [selectedHintIdx, setSelectedHintIdx] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [start, setStart] = useState<number>(() => Date.now());
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Bygg par och listor för denna omgång
  const pairs = useMemo(() => buildRoundPairs(ERA_BANK), [round]);
  const eraList = useMemo(() => shuffle(ERA_BANK.map((e) => e.id as EraId)), [round]);
  const hints = useMemo(() => shuffle(pairs.map((p, i) => ({ ...p, idx: i }))), [round]);

  useEffect(() => {
    // Återställ timer vid ny omgång
    setStart(Date.now());
  }, [round]);

  const allMatched = matched.size === hints.length;
  const elapsedSec = Math.floor((Date.now() - start) / 1000);

  function resetRound() {
    setRound((r) => r + 1);
    setSelectedEra(null);
    setSelectedHintIdx(null);
    setMatched(new Set());
    setAttempts(0);
    setCorrect(0);
    setShakeIdx(null);
  }

  function selectEra(id: EraId) {
    setSelectedEra((prev) => (prev === id ? null : id));
  }

  function selectHint(idx: number) {
    if (matched.has(idx)) return;
    setSelectedHintIdx((prev) => (prev === idx ? null : idx));
  }

  function tryMatch() {
    if (selectedEra == null || selectedHintIdx == null) return;
    const h = hints[selectedHintIdx];
    setAttempts((a) => a + 1);
    if (h.eraId === selectedEra) {
      const newSet = new Set(matched);
      newSet.add(selectedHintIdx);
      setMatched(newSet);
      setCorrect((c) => c + 1);
      setSelectedEra(null);
      setSelectedHintIdx(null);
    } else {
      setShakeIdx(selectedHintIdx);
      setTimeout(() => setShakeIdx(null), 500);
    }
  }

  useEffect(() => {
    tryMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEra, selectedHintIdx]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Matcha litterära epoker</h1>
            <p className="text-slate-600">Koppla varje <span className="font-semibold">epok</span> till rätt <span className="font-semibold">kännetecken</span>.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowHelp((v) => !v)} aria-expanded={showHelp}>
              <HelpCircle className="mr-2 h-4 w-4" /> Hjälp
            </Button>
            <Button onClick={resetRound}>
              <RefreshCw className="mr-2 h-4 w-4" /> Ny omgång
            </Button>
          </div>
        </header>

        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="border-slate-200 bg-slate-50/60">
                <CardContent className="p-4 text-sm text-slate-700">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Klicka först en <span className="font-semibold">epok</span>, sedan ett <span className="font-semibold">kännetecken</span>.</li>
                    <li>Träffar du rätt markeras paret grönt. Fel ger en kort vibration.</li>
                    <li>Målet är alla rätt på kortast tid och med få försök.</li>
                    <li>Tips: Träna begrepp. Läs igenom epoklistan före start.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Försök" value={attempts} />
          <Stat label="Rätt" value={correct} />
          <Stat label="Tid" value={`${elapsedSec}s`} icon={<TimerReset className="h-4 w-4 text-slate-500" />} />
          <Stat label="Omgång" value={round} />
        </div>

        {/* Spelyta */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Epoker */}
          <Column title="Epoker">
            <div className="grid grid-cols-1 gap-3">
              {eraList.map((id) => (
                <EraChip
                  key={id}
                  id={id}
                  name={ERA_BANK.find((e) => e.id === id)!.name}
                  active={selectedEra === id}
                  onClick={() => selectEra(id)}
                />
              ))}
            </div>
          </Column>

          {/* Kännetecken */}
          <Column title="Kännetecken">
            <div className="grid grid-cols-1 gap-3">
              {hints.map((h, idx) => {
                const isMatched = matched.has(idx);
                const isActive = selectedHintIdx === idx;
                return (
                  <motion.div
                    key={idx}
                    animate={shakeIdx === idx ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <button
                      className={
                        "w-full rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-400 " +
                        (isMatched
                          ? " border-green-300 bg-green-50"
                          : isActive
                          ? " border-indigo-400 bg-indigo-50"
                          : " border-slate-200 bg-white hover:bg-slate-50")
                      }
                      onClick={() => selectHint(idx)}
                      aria-pressed={isActive}
                    >
                      <div className="flex items-start gap-2">
                        {isMatched ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                        ) : (
                          <Badge variant="secondary" className="mt-0.5">?
                          </Badge>
                        )}
                        <span className={isMatched ? "text-slate-600 line-through" : ""}>{h.hint}</span>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </Column>
        </div>

        {/* Klar-ruta */}
        <AnimatePresence>
          {allMatched && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mt-6"
            >
              <Card className="border-indigo-200 bg-indigo-50">
                <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold">Snyggt matchat!</h2>
                    <p className="text-slate-700">{correct} / {hints.length} rätt • {attempts} försök • {elapsedSec} sekunder</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setShowHelp(true)}>Visa tips</Button>
                    <Button onClick={resetRound}><RefreshCw className="mr-2 h-4 w-4"/> Spela igen</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Facit / lärarstöd */}
        <div className="mt-8">
          <details className="group">
            <summary className="cursor-pointer select-none text-sm font-medium text-slate-700 transition group-open:text-slate-900">Facit och lärarstöd</summary>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {ERA_BANK.map((era) => (
                <Card key={era.id}>
                  <CardContent className="p-4">
                    <h3 className="mb-1 text-base font-semibold">{era.name}</h3>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {era.hints.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function EraChip({ id, name, active, onClick }: { id: EraId; name: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-400 " +
        (active ? " border-indigo-400 bg-indigo-50" : " border-slate-200 bg-white hover:bg-slate-50")
      }
      aria-pressed={active}
    >
      <span className="font-medium">{name}</span>
      <span className="text-xs uppercase tracking-wide text-slate-400">{id}</span>
    </button>
  );
}

function Stat({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}
