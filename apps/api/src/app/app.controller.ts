import { Body, Controller, Get, Post } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Point, getWindows, mouse } from '@nut-tree/nut-js';
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
  constructor(private readonly appService: AppService) {
    this.init();
  }
  private async init() {
    const windows = await await getWindows();
    for (let i = 0; i < windows.length; i++) {
      const title = await windows[i].title;
      if (title.includes('RuneLite')) {
        this.gameWindow = windows[i];
      }
    }
  }

  private lastClick;

  private gameWindow;

  // @Interval('clicks', 600)
  async checkClicks() {
    if (!this.gameWindow) {
      console.info('No windows!');
      return;
    }
    if (!this.clicks.length) {
      console.info('No clicks!');
      return;
    }
    const clicks = await fetch('http://5.78.40.178:3000/api/clicks').then((r) =>
      r.json()
    );
    const latest = clicks[this.clicks.length - 1];
    if (this.lastClick.x === latest.x && this.lastClick.y === latest.y) {
      console.info('No new clicks!');
      return;
    }
    this.lastClick = latest;

    console.log('clicking');

    const region = await this.gameWindow.region;

    const values: number[][] = Array(100)
      .fill(0)
      .map(() => Array(200).fill(0));

    this.clicks.forEach((c) => {
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
    console.log(point);

    const percentX = point.x / 200;
    const percentY = point.y / 100;
    const relX = region.width * percentX;
    const relY = region.height * percentY;
    const x = relX + region.left;
    const y = relY + region.top;
    await mouse.setPosition(new Point(x, y));
    await mouse.leftClick();
  }

  @Get()
  async getData() {
    await mouse.setPosition(new Point(500, 500));
    return this.appService.getData();
  }

  private clicks: { x: number; y: number; type: string; time: Date }[] = [];

  @Get('/clicks')
  async getClicks() {
    return this.clicks.map((v) => ({ x: v.x, y: v.y, type: v.type }));
  }

  @Get('deleteClicks')
  async deleteClicks() {
    const timeLimit = new Date();
    timeLimit.setSeconds(timeLimit.getSeconds() - 0.2);
    this.clicks = this.clicks.filter((click) => click.time > timeLimit);
  }

  @Interval(100)
  async clearOldClicks() {
    const time = new Date();
    time.setSeconds(time.getSeconds() - 3);
    this.clicks = this.clicks.filter((c) => c.time > time);
  }

  @Post('/click')
  async addClick(@Body() click: ClickDto) {
    if (
      typeof click !== 'object' ||
      !click.hasOwnProperty('x') ||
      !click.hasOwnProperty('y') ||
      typeof click.x !== 'number' ||
      typeof click.y !== 'number'
    ) {
      // console.log(click);
      return 'no';
    }
    this.clicks.push({
      x: click.x,
      y: click.y,
      time: new Date(),
      type: 'left',
    });
    return 'click';
  }
}
