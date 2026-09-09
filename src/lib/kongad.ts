// Kongad Protocol Phase Deliverables Data Definitions

export interface PhaseTask {
  id: string;
  phaseId: number;
  title: string;
  category: 'hardware' | 'software' | 'operations' | 'presentation';
  description: string;
  dueDate?: string;
}

export const KONGAD_TASKS: PhaseTask[] = [
  // PHASE 01: THE SETUP (SEP 2026)
  {
    id: 'p1-mla-deck',
    phaseId: 1,
    title: 'MLA Pitch Deck Print & Binding',
    category: 'presentation',
    description: 'Finalize high-resolution print copy of MLA Vikasana Pitch Deck for presentation.',
    dueDate: '2026-09-15',
  },
  {
    id: 'p1-navara-seed',
    phaseId: 1,
    title: '8kg Navara Seed Order',
    category: 'operations',
    description: 'Procure 8kg certified organic Navara medicinal rice seeds for field testing.',
    dueDate: '2026-09-20',
  },
  {
    id: 'p1-[#e38b6c]-sparkx',
    phaseId: 1,
    title: 'KSUM SparkX Kickoff & Registration',
    category: 'operations',
    description: 'Submit official application & attend KSUM SparkX incubation orientation.',
    dueDate: '2026-09-28',
  },

  // PHASE 02: FOUNDATION & SCHEMA (OCT 2026)
  {
    id: 'p2-mother-farm',
    phaseId: 2,
    title: '50-Cent Mother Farm Sowing',
    category: 'operations',
    description: 'Prepare land & sow 50-cent agricultural plot with Navara seed baseline.',
    dueDate: '2026-10-10',
  },
  {
    id: 'p2-fastapi-schema',
    phaseId: 2,
    title: 'FastAPI & PostgreSQL Schema Setup',
    category: 'software',
    description: 'Architect scalable PostgreSQL database tables & async FastAPI endpoints.',
    dueDate: '2026-10-18',
  },
  {
    id: 'p2-nextjs-portal',
    phaseId: 2,
    title: 'Next.js Management Portal (Strict Types)',
    category: 'software',
    description: 'Build Next.js App Router management portal with 100% strict TypeScript types.',
    dueDate: '2026-10-25',
  },
  {
    id: 'p2-vision-layer',
    phaseId: 2,
    title: 'Vision Layer Core Pipeline Setup',
    category: 'software',
    description: 'Integrate computer vision model for crop disease & growth rate estimation.',
    dueDate: '2026-10-30',
  },

  // PHASE 03: IOT & DEMO PREP (NOV 2026)
  {
    id: 'p3-hydroleaf-iot',
    phaseId: 3,
    title: 'HydroLeaf IoT Sensor Assembly & Telemetry',
    category: 'hardware',
    description: 'Assemble ESP32/LoRa soil moisture & pH sensors for automated field telemetry.',
    dueDate: '2026-11-15',
  },
  {
    id: 'p3-ksum-demoday',
    phaseId: 3,
    title: 'KSUM Demo Day Pitch (Nov 30)',
    category: 'presentation',
    description: 'Present live working prototype to KSUM investors and agri-tech partners.',
    dueDate: '2026-11-30',
  },

  // PHASE 04: AUDIT & VOICE AI (DEC 2026)
  {
    id: 'p4-system-audit',
    phaseId: 4,
    title: 'Full-System Security & Latency Audit',
    category: 'software',
    description: 'Execute end-to-end stress tests, database index tuning, and offline validation.',
    dueDate: '2026-12-10',
  },
  {
    id: 'p4-mla-dashboard',
    phaseId: 4,
    title: 'MLA Vikasana Dashboard Live Demo',
    category: 'presentation',
    description: 'Demonstrate live constituency agricultural monitoring dashboard to key stakeholders.',
    dueDate: '2026-12-20',
  },
  {
    id: 'p4-malayalam-voice',
    phaseId: 4,
    title: 'Malayalam Voice AI Protocol Testing',
    category: 'software',
    description: 'Test localized Malayalam voice synthesis & STT model for farmer advisory audio.',
    dueDate: '2026-12-28',
  },
];
