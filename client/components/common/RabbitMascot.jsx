// Simple pixel-art rabbit, drawn from a text bitmap so it's easy to tweak.
// '.' = transparent, 'K' = outline, 'W' = fur, 'P' = inner ear

const BITMAP = [
  "..K......K..",
  ".KWK....KWK.",
  ".KWK....KWK.",
  ".KPK....KPK.",
  ".KWK....KWK.",
  ".KWK....KWK.",
  "..KWWWWWWK..",
  ".KWWWWWWWWK.",
  "KWWKWWWWKWWK",
  "KWWWWWWWWWWK",
  "KWWWWWWWWWWK",
  "KWWWWWWWWWWK",
  ".KWWWWWWWWK.",
  "..KKKKKKKK..",
];

const COLORS = {
  K: "#0b1120",
  W: "#fefefe",
  P: "#ffb3c6",
};

function RabbitMascot({ size = 6 }) {
  const rows = BITMAP.length;
  const cols = BITMAP[0].length;

  return (
    <svg
      width={cols * size}
      height={rows * size}
      viewBox={`0 0 ${cols * size} ${rows * size}`}
      shapeRendering="crispEdges"
    >
      {BITMAP.map((row, y) =>
        row.split("").map((cell, x) => {
          if (cell === ".") return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * size}
              y={y * size}
              width={size}
              height={size}
              fill={COLORS[cell]}
            />
          );
        })
      )}
    </svg>
  );
}

export default RabbitMascot;