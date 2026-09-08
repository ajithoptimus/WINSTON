export interface CrucibleDrill {
  id: string;
  title: string;
  subtitle: string;
  instructions: string[];
  durationMinutes: number;
}

export interface ReconCue {
  id: string;
  title: string;
  category: string;
  cueText: string;
  focusPoints: string[];
}

export interface SystemsFocus {
  id: string;
  title: string;
  durationMinutes: number;
  tasks: string[];
}

export const CRUCIBLE_DRILLS: CrucibleDrill[] = [
  {
    id: 'acidus-novus',
    title: 'Acidus Novus / Billet Glance Drill',
    subtitle: 'Rapid 3-Second Cognitive Extraction',
    instructions: [
      'Glance at a target visual element or text block for exactly 3 seconds.',
      'Close eyes immediately; reconstruct 4 micro-details (text, spatial position, color, intent).',
      'Repeat 5 cycles, accelerating visual absorption speed.'
    ],
    durationMinutes: 5,
  },
  {
    id: 'force-37',
    title: '37 Force Script Pacing',
    subtitle: 'Subconscious Verbal Rhythm Synchronization',
    instructions: [
      'Speak a test sentence at baseline speed.',
      'Pace delivery to match a 60 BPM metronome rhythm.',
      'Control micro-pauses before key emphasis words.'
    ],
    durationMinutes: 5,
  },
  {
    id: 'speech-desync',
    title: 'Backwards Speech Desynchronization',
    subtitle: 'Auditory Reverse-Processing Mental Warmup',
    instructions: [
      'Take a 5-word sentence and pronounce phonemes in reverse sequence.',
      'Force auditory isolation without subvocalizing the original meaning.',
      'Enhance raw cognitive plasticity and working memory.'
    ],
    durationMinutes: 5,
  },
  {
    id: 'micro-matrix',
    title: 'Micro-Expression Matrix Scan',
    subtitle: 'Sub-200ms Facial Tell Identification',
    instructions: [
      'Focus on eyebrows, eye aperture, and lip corners in mental recall.',
      'Simulate 10 micro-tell transitions (contempt asymmetry, flash fear, suppress smile).',
      'Record instant instinctive classification speed.'
    ],
    durationMinutes: 5,
  },
  {
    id: 'dual-grid',
    title: 'Dual-N-Back Auditory Grid Focus',
    subtitle: 'Working Memory Expansion',
    instructions: [
      'Maintain 2 simultaneous data streams in mental buffer (position + letter).',
      'Match current item to item N steps prior.',
      'Sustain zero-error focus for 300 seconds.'
    ],
    durationMinutes: 5,
  }
];

export const RECON_CUES: ReconCue[] = [
  {
    id: 'speech-cadence',
    title: 'Baseline Speech Cadence vs. Stress Pitch Shift',
    category: 'Human Metrics',
    cueText: 'Observe key speakers during conversation. Detect pitch elevation, sudden tempo acceleration, or micro-swallowing before high-stake disclosures.',
    focusPoints: ['Vocal frequency shift', 'Syllable density change', 'Micro-throat clears']
  },
  {
    id: 'football-shoulders',
    title: 'Football / Sports: 3-Second Off-Ball Shoulder Check',
    category: 'Spatial Perception',
    cueText: 'In sports, matches, or crowded spaces, execute a blind-spot shoulder check every 3 seconds to update peripheral radar map.',
    focusPoints: ['Head swivel frequency', 'Spatial positioning', 'Anticipation vector']
  },
  {
    id: 'micro-tells',
    title: 'Blink Rate Acceleration & Lip Compression',
    category: 'Micro-Interactions',
    cueText: 'Track blink rate spikes (>40/min) during direct questions and notice lip pressing when objection or concealment is present.',
    focusPoints: ['Blink rate baseline', 'Lip compression', 'Hand-to-face contacts']
  },
  {
    id: 'posture-expansion',
    title: 'Territorial Posture Expansion vs Contraction',
    category: 'Dominance Dynamics',
    cueText: 'Identify when individuals expand elbow width and shoulder footprint upon taking authority vs leaning back and shielding core.',
    focusPoints: ['Arm splay width', 'Torso exposure', 'Asymmetric shifts']
  },
  {
    id: 'gaze-aversion',
    title: 'Gaze Shift Duration & Micro-Hesitation',
    category: 'Cognitive Load',
    cueText: 'Measure reaction latency when asked unexpected technical questions. Watch left/right eye movements indicating memory retrieval vs constructive logic.',
    focusPoints: ['Gaze vector angle', 'Response delay (ms)', 'Pupil dilation shift']
  }
];

export const SYSTEMS_FOCUSES: SystemsFocus[] = [
  {
    id: 'tcp-handshake',
    title: 'Raw TCP Handshake & SYN/ACK Flag Analysis',
    durationMinutes: 15,
    tasks: [
      'Inspect packet capture (tcpdump / Wireshark) for SYN, SYN-ACK, ACK sequence.',
      'Check window size negotiation & TCP options (SACK, Window Scaling).',
      'Verify zero retransmissions under normal link conditions.'
    ]
  },
  {
    id: 'memory-alloc',
    title: 'Memory Allocations & Heap Fragmentation Audit',
    durationMinutes: 15,
    tasks: [
      'Trace heap allocations vs stack memory usage in critical loops.',
      'Identify potential object churn creating Garbage Collection latency spikes.',
      'Verify buffer reuse patterns for zero-copy data paths.'
    ]
  },
  {
    id: 'ebpf-trace',
    title: 'Kernel Latency & Context Switch Profiling',
    durationMinutes: 15,
    tasks: [
      'Review system calls creating futex wait locks.',
      'Measure CPU L1/L3 cache misses across worker threads.',
      'Audit thread pool queue bounds to avoid head-of-line blocking.'
    ]
  },
  {
    id: 'simd-assembly',
    title: 'SIMD Vectorization & Memory Alignment',
    durationMinutes: 15,
    tasks: [
      'Inspect compiler assembly output for AVX/NEON vector instructions.',
      'Ensure 64-byte alignment on critical data arrays.',
      'Verify loop unrolling efficiency without branch mispredictions.'
    ]
  }
];

/** Deterministically pick items based on calendar date string */
export function getDeterministicDirectives(dateStr: string) {
  const hash = Array.from(dateStr).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dayOfWeek = new Date(dateStr).getDay();

  const drill = CRUCIBLE_DRILLS[hash % CRUCIBLE_DRILLS.length];
  const recon = RECON_CUES[(hash + dayOfWeek) % RECON_CUES.length];
  const systems = SYSTEMS_FOCUSES[(hash + 3) % SYSTEMS_FOCUSES.length];

  return { drill, recon, systems };
}
