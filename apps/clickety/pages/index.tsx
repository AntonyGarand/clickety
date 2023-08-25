import { Button } from 'primereact/button';
import { useEffect, useRef, useState } from 'react';
import { SrsRtcWhipWhepAsync } from '../lib/srs/srs.sdk';
import { doClick } from '../lib/api';

// function mulberry32(a) {
//   a = parseInt(a.replaceAll('-', ''), 36) % 1_000_000;
//   return function () {
//     let t = (a += 0x6d2b79f5);
//     t = Math.imul(t ^ (t >>> 15), t | 1);
//     t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
//     return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
//   };
// }

// function getRandomColor(seed?: string) {
//   let random = Math.random;
//   if (seed) {
//     random = mulberry32(seed);
//   }
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(random() * 16)];
//   }
//   return color;
// }

export default function Index() {
  const player = useRef<HTMLVideoElement>(null);
  const overlay = useRef<SVGSVGElement>(null);
  const [playerPos, setPlayerPos] = useState<DOMRect>();

  useEffect(() => {
    if (!player.current) return;
    const resizeObserver = new ResizeObserver(() => {
      setPlayerPos(player.current?.getBoundingClientRect());
    });
    resizeObserver.observe(player.current);
    return () => resizeObserver.disconnect();
  }, [player]);

  const onClick = (event) => {
    // @ts-ignore
    const dim = overlay.current.getBoundingClientRect();
    const x = Math.round(event.clientX - dim.left);
    const y = Math.round(event.clientY - dim.top);
    const percentX = Math.round((x / dim.width) * 1000);
    const percentY = Math.round((y / dim.height) * 1000);

    doClick(percentX, percentY);
  };

  let sdk: any = null; // Global handler to do cleanup when republishing.
  const startPlay = function () {
    // Close PC when user replay.
    if (sdk) {
      sdk.close();
    }
    // @ts-ignore
    sdk = new SrsRtcWhipWhepAsync();

    // User should set the stream when publish is done, @see https://webrtc.org/getting-started/media-devices
    // However SRS SDK provides a consist API like https://webrtc.org/getting-started/remote-streams
    // @ts-ignore
    player.current.srcObject = sdk.stream;
    // Optional callback, SDK will add track to stream.
    // sdk.ontrack = function (event) { console.log('Got track', event); sdk.stream.addTrack(event.track); };

    // For example: webrtc://r.ossrs.net/live/livestream
    const url =
      'http://5.161.53.116:1985/rtc/v1/whip-play/?app=live&stream=livestream';
    sdk.play(url).catch(function (reason) {
      sdk.close();
      // document.getElementById('rtc_media_player').hide();
      console.error(reason);
    });
  };

  // useEffect(() => {
  //   // @ts-ignore
  //   overlay.current.style.width = playerPos?.width.toString() || '';
  //   // @ts-ignore
  //   overlay.current.style.height = playerPos?.height.toString() || '';
  // }, [playerPos]);

  return (
    <div>
      <div>
        <div className="container">
          <video
            id="rtc_media_player"
            ref={player}
            controls={false}
            autoPlay
            style={{ maxWidth: '100vw', maxHeight: '80vh', position: 'fixed' }}
          ></video>
        </div>

        <svg
          ref={overlay}
          id="overlay"
          style={{
            maxWidth: '100vw',
            maxHeight: '80vh',
            // backgroundColor: 'rgba(1,1,1,.5)',
            position: 'fixed',
            width: playerPos?.width,
            height: playerPos?.height,
          }}
          onClick={onClick}
        >
          {/* {data?.click?.map((c) => {
            const percentX = c.x;
            const percentY = c.y;
            const width = playerPos?.width || 1;
            const height = playerPos?.height || 1;
            const x = (percentX / 1000) * width;
            const y = (percentY / 1000) * height;
            return (
              <circle
                key={c.id}
                cx={x}
                style={{ zIndex: -1 }}
                cy={y}
                r="10"
                fill={getRandomColor(c.id.toString())}
                opacity={0.5}
              />
            );
          })} */}
        </svg>

        <Button
          onClick={startPlay}
          label="play"
          style={{ position: 'fixed', bottom: 0, left: 0, margin: 20 }}
        />
      </div>
    </div>
  );
}
