"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SoundType = "off" | "rain" | "white-noise" | "lo-fi";

export const SOUND_CYCLE: SoundType[] = ["off", "rain", "white-noise", "lo-fi"];

export const SOUND_LABELS: Record<SoundType, string> = {
  off: "OFF",
  rain: "RAIN",
  "white-noise": "WHITE NOISE",
  "lo-fi": "LO-FI",
};

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const frameCount = ctx.sampleRate * 3; // 3-second looping buffer
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function useAmbientSound() {
  const [sound, setSound] = useState<SoundType>("off");
  const [volume, setVolume] = useState(0.25);
  const ctxRef = useRef<AudioContext | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stopCurrent = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  const play = useCallback(
    (type: SoundType, vol: number) => {
      stopCurrent();
      if (type === "off") return;

      const ctx = (ctxRef.current ??= new AudioContext());
      if (ctx.state === "suspended") ctx.resume();

      const master = ctx.createGain();
      master.gain.value = vol;
      master.connect(ctx.destination);

      const buf = createNoiseBuffer(ctx);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      if (type === "white-noise") {
        src.connect(master);
      } else if (type === "rain") {
        // Lowpass filtered noise sounds like distant rain
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 550;
        lp.Q.value = 0.3;
        src.connect(lp);
        lp.connect(master);
      } else if (type === "lo-fi") {
        // Bandpass-filtered noise — warm, muffled ambience
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 180;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 2800;
        lp.Q.value = 1.2;
        src.connect(hp);
        hp.connect(lp);
        lp.connect(master);
      }

      src.start();

      cleanupRef.current = () => {
        try {
          src.stop();
          src.disconnect();
          master.disconnect();
        } catch {
          // already stopped — ignore
        }
      };
    },
    [stopCurrent]
  );

  // Restart when sound or volume changes
  useEffect(() => {
    play(sound, volume);
    return stopCurrent;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound, volume]);

  // Close AudioContext on unmount
  useEffect(() => {
    return () => {
      stopCurrent();
      ctxRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cycleSound = useCallback(() => {
    setSound((prev) => {
      const i = SOUND_CYCLE.indexOf(prev);
      return SOUND_CYCLE[(i + 1) % SOUND_CYCLE.length];
    });
  }, []);

  return { sound, setSound, volume, setVolume, cycleSound };
}
