import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Ip,
  Post,
  Query,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

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
  private clicks: { x: number; y: number; type: string; time: Date }[] = [];

  @Get('/clicks')
  async getClicks(@Query('key') key: string) {
    if (key !== process.env.API_KEY) {
      throw new ForbiddenException();
    }
    return this.clicks.map((v) => ({ x: v.x, y: v.y, type: v.type }));
  }

  @Interval(100)
  async clearOldClicks() {
    const time = new Date();
    time.setSeconds(time.getSeconds() - 0.6);
    this.clicks = this.clicks.filter((c) => c.time > time);
  }

  private ips: [Date, string][] = [];
  private ipSet: Set<string> = new Set();

  @Interval(100)
  private updateIps() {
    const deadline = new Date();
    deadline.setMilliseconds(deadline.getMilliseconds() - 300);
    this.ips = this.ips.filter((i) => i[0] > deadline);
    this.ipSet = new Set(this.ips.map((i) => i[1]));
  }

  @Post('/click')
  async addClick(@Body() click: ClickDto, @Ip() ip: string) {
    if (this.ipSet.has(ip)) {
      return 'click2';
    }
    const now = new Date();
    this.ips.push([now, ip]);
    this.ipSet.add(ip);

    if (
      typeof click !== 'object' ||
      !click.hasOwnProperty('x') ||
      !click.hasOwnProperty('y') ||
      typeof click.x !== 'number' ||
      typeof click.y !== 'number'
    ) {
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
