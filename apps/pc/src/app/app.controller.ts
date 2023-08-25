import { Body, Controller, Get, Post } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Point, getActiveWindow, mouse } from '@nut-tree/nut-js';
import { AppService } from './app.service';

export class ClickDto {
  x: number;
  y: number;
  type?: string;
}

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

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private lastClick = { x: 0, y: 0 };

  // Units is % of place
  private deadzones: { x: number; y: number; width: number; height: number }[] =
    [
      { x: 0, y: 0, width: 1, height: 0.3125 },
      { x: 0.975, y: 0, width: 0.026, height: 1 },
      { x: 0.927, y: 0.268, width: 0.073, height: 0.035 },
      { x: 0.821, y: 0.935, width: 0.094, height: 0.065 },
      { x: 0.893, y: 0.851, width: 0.065, height: 0.93 },
      { x: 0.143, y: 0.769, width: 0.096, height: 0.074 },
      // // Topbar
      // { x: 0, y: 0, width: 1, height: 0.05 },
      // // Sidebar
      // { x: 0.95, y: 0, width: .10, height: 1 },
      // // Wiki
      // { x: .86, y: .32, width: .20, height: 0.05 },
      // // Settings
      // { x: .74, y: .92, width: .13, height: 0.10 },
      // // World
      // { x: 0, y: .92, width: .14, height: 0.10 },
    ];

  @Interval('clicks', 600)
  async checkClicks() {
    const active = await getActiveWindow();
    if (!(await active.title).includes('RuneLite')) {
      console.log('Not runelite');
      return;
    }
    const region = await active.region;
    const clicks = await fetch(
      `http://localhost:3001/api/clicks?key=${process.env.API_KEY}`
    ).then((r) => r.json());
    if (!clicks.length) {
      console.info('No clicks!');
      return;
    }
    const latest = clicks[clicks.length - 1];
    if (this.lastClick.x === latest.x && this.lastClick.y === latest.y) {
      console.info('No new clicks!');
      return;
    }
    this.lastClick = latest;

    const values: number[][] = Array(100)
      .fill(0)
      .map(() => Array(200).fill(0));

    clicks.forEach((c) => {
      const x = Math.floor(c.x / 5);
      const y = Math.floor(c.y / 10);
      values[y][x] += 1;
      findRange({ x, y }, 3).forEach((coord) => {
        values[coord.y][coord.x] += 1;
      });
    });
    const max = Math.max(...values.map((v) => Math.max(...v)));

    const maxCoords = [];
    values.forEach((col, y) =>
      col.forEach((value, x) => {
        if (value === max) {
          maxCoords.push({ x, y });
        }
      })
    );

    const point = maxCoords[Math.floor(Math.random() * maxCoords.length)];

    const percentX = point.x / 200;
    const percentY = point.y / 100;

    if (
      this.deadzones.some((zone) => {
        return (
          percentX >= zone.x &&
          percentX <= zone.x + zone.width &&
          percentY >= zone.y &&
          percentY <= zone.y + zone.height
        );
      })
    ) {
      // Trying to click in an illegal spot
      console.warn('Deadzone!');
      return;
    }

    const relX = region.width * percentX;
    const relY = region.height * percentY;
    const x =
      relX +
      region.left +
      Math.round(((Math.random() - 0.5) * region.width) / 400);
    const y =
      relY +
      region.top +
      Math.round(((Math.random() - 0.5) * region.height) / 200);
    setTimeout(async () => {
      await mouse.setPosition(new Point(x, y));
      await mouse.leftClick();
    }, Math.ceil(Math.random() * 100));
  }
}
