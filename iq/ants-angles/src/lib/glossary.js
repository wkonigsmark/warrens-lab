// Kid-friendly glossary content. Colors intentionally match the classification
// badges in the Explorers so a term's dot here = its color on the figure.

// Display names for each topic (used by the master search results).
export const TOPIC_LABELS = {
  angles: 'Angles',
  triangles: 'Triangles',
  area: 'Area & Polygons',
  circles: 'Circles & Pi',
}

export const GLOSSARY = {
  angles: [
    {
      heading: 'Kinds of angle',
      terms: [
        { term: 'Acute angle', def: 'Smaller than 90° — a sharp, narrow angle.', color: '#22c55e' },
        { term: 'Right angle', def: 'Exactly 90° — a perfect square corner.', color: '#3b82f6' },
        { term: 'Obtuse angle', def: 'Bigger than 90° but less than 180° — wide and open.', color: '#f59e0b' },
        { term: 'Straight angle', def: 'Exactly 180° — the two arms make a straight line.', color: '#8b5cf6' },
        { term: 'Reflex angle', def: 'Bigger than 180° — more than half of a full turn.', color: '#ef4444' },
      ],
    },
    {
      heading: 'Good to know',
      terms: [
        { term: 'Vertex', def: 'The point where the two arms of the angle meet.' },
        { term: 'Degree (°)', def: 'The unit we measure angles in. A full turn is 360°.' },
        { term: 'Full turn', def: 'All the way around — 360°, back to where you started.' },
        { term: 'Complementary angles', def: 'Two angles that add up to 90°.' },
        { term: 'Supplementary angles', def: 'Two angles that add up to 180°.' },
        { term: 'Vertical angles', def: 'When two lines cross, the angles opposite each other are equal.' },
      ],
    },
  ],

  triangles: [
    {
      heading: 'Named by their angles',
      terms: [
        { term: 'Acute triangle', def: 'All three angles are smaller than 90°.', color: '#22c55e' },
        { term: 'Right triangle', def: 'One angle is exactly 90° — a square corner.', color: '#3b82f6' },
        { term: 'Obtuse triangle', def: 'One angle is bigger than 90°.', color: '#f59e0b' },
      ],
    },
    {
      heading: 'Named by their sides',
      terms: [
        { term: 'Equilateral', def: 'All three sides equal — so all three angles are 60°.', color: '#8b5cf6' },
        { term: 'Isosceles', def: 'Two sides equal — the two angles opposite them match too.', color: '#ec4899' },
        { term: 'Scalene', def: 'Every side a different length, and no two angles the same.', color: '#0ea5e9' },
      ],
    },
    {
      heading: 'Good to know',
      terms: [
        { term: 'Vertex', def: 'A corner where two sides meet. Every triangle has 3.' },
        { term: 'Interior angles', def: 'The angles inside the triangle — they always add up to 180°.' },
        { term: 'Perimeter', def: 'The distance all the way around — add up the three sides.' },
        { term: 'Area', def: 'The amount of flat space inside the triangle.' },
        { term: 'Hypotenuse', def: 'The longest side of a right triangle — always opposite the right angle.', color: '#f59e0b' },
        { term: 'Pythagorean theorem', def: 'In a right triangle, the squares on the two short sides add up to the square on the longest: a² + b² = c².', color: '#8b5cf6' },
      ],
    },
  ],

  area: [
    {
      heading: 'Shapes',
      terms: [
        { term: 'Polygon', def: 'A closed shape made of straight sides — like a triangle or a hexagon.', color: '#6366f1' },
        { term: 'Quadrilateral', def: 'Any polygon with 4 sides (squares and rectangles are quadrilaterals).' },
        { term: 'Pentagon', def: 'A polygon with 5 sides.' },
        { term: 'Hexagon', def: 'A polygon with 6 sides.' },
        { term: 'Regular polygon', def: 'A shape where every side and every angle is equal.', color: '#8b5cf6' },
      ],
    },
    {
      heading: 'Measuring',
      terms: [
        { term: 'Area', def: 'The amount of flat space inside a shape, counted in square units.', color: '#6366f1' },
        { term: 'Perimeter', def: 'The distance all the way around — add up every side.' },
        { term: 'Square unit', def: 'One little square on the grid. Area is how many of them fit inside.' },
        { term: 'Length × Width', def: 'For a rectangle, multiply the two side lengths to get the area.' },
      ],
    },
    {
      heading: 'Good to know',
      terms: [
        { term: 'Side', def: 'One of the straight edges of a polygon.' },
        { term: 'Vertex', def: 'A corner where two sides meet.' },
      ],
    },
  ],

  circles: [
    {
      heading: 'Parts of a circle',
      terms: [
        { term: 'Radius', def: 'The distance from the center to the edge.', color: '#6366f1' },
        { term: 'Diameter', def: 'All the way across through the center — twice the radius.', color: '#6366f1' },
        { term: 'Circumference', def: 'The distance all the way around the circle.', color: '#0ea5e9' },
        { term: 'Center', def: 'The middle point — the same distance from every edge.' },
      ],
    },
    {
      heading: 'All about π (pi)',
      terms: [
        { term: 'Pi (π)', def: 'A special number, about 3.14 — the circumference divided by the diameter.', color: '#8b5cf6' },
        { term: 'Circumference formula', def: 'C = π × diameter (or 2 × π × radius).' },
        { term: 'Area formula', def: 'A = π × radius × radius.' },
      ],
    },
    {
      heading: 'Good to know',
      terms: [
        { term: 'Square unit', def: 'Area is measured in square units — how much space fits inside.' },
        { term: 'Constant', def: 'π is the same for every circle, big or small.' },
      ],
    },
  ],
}

// Flat index of every term across all topics — powers the master search.
export const ALL_TERMS = Object.entries(GLOSSARY).flatMap(([topic, groups]) =>
  groups.flatMap((g) => g.terms.map((t) => ({ ...t, topic, heading: g.heading })))
)
