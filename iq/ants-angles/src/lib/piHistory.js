// The story of π as a structured timeline. `visual` keys pick an illustration
// (defined in PiStory.jsx, rendered by the generic StoryModal). Text is written
// to be readable for older kids and parents without losing the real history.
export const PI_ERAS = [
  {
    id: 'ancient',
    title: 'The Ancient World',
    range: '~1650 – 250 BCE',
    color: '#f59e0b',
    entries: [
      {
        year: '~1650 BCE',
        who: 'Egyptian Rhind Papyrus',
        value: '≈ 3.16',
        text: 'Egyptian scribes used a value of about 3.16 to work with circles — close enough to build with. They were not chasing a perfect number, just one that worked.',
      },
      {
        year: '~1600 BCE',
        who: 'Babylonian tablets',
        value: '3.125',
        text: 'Babylonian clay tablets used 3⅛ (25/8). Like the Egyptians, they only needed numbers good enough to get buildings and canals made.',
      },
      {
        year: '~250 BCE',
        who: 'Archimedes of Syracuse',
        value: '223/71 – 22/7',
        text: 'The founding genius of π. He trapped a circle between two polygons — up to 96 sides each — to prove π was between 3.1408 and 3.1429. This "squeeze" was the seed of calculus, 1,900 years early.',
        visual: 'polygons',
      },
    ],
  },
  {
    id: 'medieval',
    title: 'Classical & Medieval',
    range: '~150 – 1400 CE',
    color: '#0ea5e9',
    entries: [
      {
        year: '~150 CE',
        who: 'Ptolemy',
        value: '377/120 ≈ 3.1417',
        text: 'Used in his great astronomy book, the Almagest — the standard in Europe for centuries.',
      },
      {
        year: '~263 CE',
        who: 'Liu Hui (China)',
        value: '3.14159',
        text: 'Pushed the polygon idea to a 3,072-sided shape, reaching 5 correct decimal places.',
      },
      {
        year: '~480 CE',
        who: 'Zu Chongzhi (China)',
        value: '355/113',
        text: 'Found the astonishing fraction 355/113 — correct to 6 decimals. Nobody in Europe beat it for nearly 900 years.',
      },
      {
        year: '~1400 CE',
        who: 'Madhava (India)',
        value: 'an endless sum',
        text: 'Discovered the first infinite series for π — a sum that never ends but creeps ever closer. This turned π from a thing you measure into a thing you calculate.',
        visual: 'series',
      },
    ],
  },
  {
    id: 'early-modern',
    title: 'Early Modern Europe',
    range: '1596 – 1706',
    color: '#8b5cf6',
    entries: [
      {
        year: '1596',
        who: 'Ludolph van Ceulen',
        value: '35 decimals',
        text: 'Spent much of his life grinding out 35 digits by hand with Archimedes’ polygons. In Germany, π was long called the "Ludolphine number."',
      },
      {
        year: '1706',
        who: 'John Machin',
        value: 'a fast formula',
        text: 'Found a quick arctangent formula that dominated high-precision π calculation for the next 250 years.',
      },
      {
        year: '1706',
        who: 'William Jones',
        value: 'the symbol π',
        text: 'First used the Greek letter π for the circle constant. Leonhard Euler adopted it, and the world followed.',
        visual: 'symbol',
      },
    ],
  },
  {
    id: 'deep',
    title: 'The Deep Questions',
    range: '19th century',
    color: '#6366f1',
    entries: [
      {
        year: '1761',
        who: 'Johann Lambert',
        value: 'π is irrational',
        text: 'Proved π can never be written as a fraction — its digits never end and never repeat.',
      },
      {
        year: '1882',
        who: 'Ferdinand von Lindemann',
        value: 'π is transcendental',
        text: 'Proved π is not the answer to any algebra equation — which finally proved you can’t "square the circle" with compass and straightedge, a puzzle 2,000 years old.',
      },
    ],
  },
  {
    id: 'computer',
    title: 'The Computer Age',
    range: '1914 – today',
    color: '#ec4899',
    entries: [
      {
        year: '1914',
        who: 'Srinivasa Ramanujan',
        value: '~8 digits per term',
        text: 'Discovered series so powerful that each new term adds about 8 correct digits — the basis of every modern π algorithm.',
      },
      {
        year: '1949',
        who: 'ENIAC',
        value: '2,037 digits',
        text: 'One of the first computers found 2,037 digits in about 70 hours — the dawn of computational π.',
      },
      {
        year: 'Today',
        who: 'Chudnovsky algorithm',
        value: '100+ trillion digits',
        text: 'We now know over 100 trillion digits — not because anyone needs them, but because computing π is the perfect benchmark for a supercomputer.',
        visual: 'digits',
      },
    ],
  },
]

export const PI_CLOSER =
  'Just 38 digits of π would measure the whole known universe to within the width of a hydrogen atom. Yet π can never be fully written down — perfectly defined, but endless. That tension is what makes it one of math’s most beautiful numbers.'
