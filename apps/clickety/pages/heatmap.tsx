import { useState } from 'react';
import { getClicks } from '../lib/api';
import { useInterval } from '../lib/useInterval';

export default function Index() {
  const [clicks, setClicks] = useState<
    {
      x: number;
      y: number;
      type?: string;
    }[]
  >([]);

  useInterval(async () => {
    const clicks = await getClicks();
    setClicks(clicks);
  }, 100);

  const values: number[][] = Array(100)
    .fill(0)
    .map(() => Array(200).fill(0));

  function findRange(tile: { x: number; y: number }, radius: number) {
    const tiles: { x: number; y: number }[] = [];

    const starty = Math.max(0, tile.y - radius);
    const endy = Math.min(100 - 1, tile.y + radius);

    for (let y = starty; y <= endy; y++) {
      const xrange = radius - Math.abs(y - tile.y);

      const startx = Math.max(0, tile.x - xrange);
      const endx = Math.min(200 - 1, tile.x + xrange);

      for (let x = startx; x <= endx; x++) {
        const dist = Math.sqrt((x - tile.x) ** 2 + (y - tile.y) ** 2);
        if (dist < radius) {
          tiles.push({ x, y });
        }
      }
    }

    return tiles;
  }

  clicks.forEach((c) => {
    const x = Math.floor(c.x / 5);
    const y = Math.floor(c.y / 10);
    values[y][x] += 1;
    findRange({ x, y }, 3).forEach((coord) => {
      values[coord.y][coord.x] += 1;
    });
  });
  const max = Math.max(...values.map((v) => Math.max(...v)));

  return (
    <div>
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          // backgroundColor: '#0f0',
          width: '100vw',
          height: '100vh',
          filter: 'blur(5px)',
        }}
      >
        {values.map((col, y) =>
          col.map((value, x) => {
            if (!value) {
              return null;
            }
            return (
              <rect
                key={`${x}-${y}`}
                width="1vw"
                height={'1vh'}
                x={`${(x / 2).toFixed(1)}%`}
                y={`${y}%`}
                fill={`rgba(${Math.round((value / max) * 255)},0,${Math.round(
                  ((max - value) / max) * 255
                )},${Math.max(0.5, value / max).toFixed(2)})`}
              ></rect>
            );
          })
        )}
      </svg>
    </div>
  );
}
