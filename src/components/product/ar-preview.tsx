"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Maximize2, RotateCcw, VideoOff, X } from "lucide-react";
import { needsPlainImage } from "@/lib/products";

export function ArPreview({
  image,
  name,
}: {
  image: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [scale, setScale] = useState(52);
  const [position, setPosition] = useState({ x: 50, y: 56 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    setError("");
    setReady(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot open a camera preview. Try Safari or Chrome on your phone.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setReady(true);
    } catch {
      setError(
        "Camera access was blocked. Allow camera access in your browser settings, or preview without the camera.",
      );
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void start();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      stop();
    };
  }, [open, start, stop]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!bounds) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setPosition({
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(90, y)),
    });
  }

  function onPointerUp() {
    dragRef.current.active = false;
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-outline">
        <Camera className="size-4" aria-hidden />
        See it in your space
      </button>

      {open ? (
        <div
          className="night-panel fixed inset-0 z-[110] flex flex-col bg-black/95 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Camera preview of ${name}`}
        >
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 pb-3 text-ivory">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-champagne">Camera preview</p>
              <p className="font-display text-xl">{name}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-11 place-items-center border border-ivory/25 text-ivory/80 hover:border-ivory hover:text-ivory"
              aria-label="Close camera preview"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="relative mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-hidden border border-ivory/20 bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
                ready ? "opacity-100" : "opacity-0"
              }`}
            />
            {!ready ? (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#3b3630_0%,#171512_75%)]" />
            ) : null}

            <div
              className="absolute select-none"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${scale}%`,
                transform: "translate(-50%, -50%)",
                touchAction: "none",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="relative aspect-[4/5] cursor-move overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
                <Image
                  src={image}
                  alt={`${name} camera overlay`}
                  fill
                  sizes="(max-width: 1024px) 70vw, 520px"
                  unoptimized={needsPlainImage(image)}
                  className="object-cover"
                />
                <span className="pointer-events-none absolute inset-0 border border-white/30" />
              </div>
              <p className="mt-2 text-center text-[8px] uppercase tracking-[0.16em] text-ivory/70">
                Drag to place
              </p>
            </div>

            {error ? (
              <div className="absolute inset-x-4 bottom-4 border border-ivory/20 bg-black/85 p-4 text-ivory">
                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-ivory/80">
                  <VideoOff className="mt-0.5 size-4 shrink-0 text-champagne" aria-hidden />
                  {error}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void start()}
                    className="border border-ivory/30 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-ivory/80 hover:border-ivory hover:text-ivory"
                  >
                    Try camera again
                  </button>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="border border-ivory/30 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-ivory/80 hover:border-ivory hover:text-ivory"
                  >
                    Preview on a plain backdrop
                  </button>
                </div>
              </div>
            ) : null}

            <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 bg-black/70 px-3 py-2.5 text-ivory backdrop-blur-sm">
              <Maximize2 className="size-4 shrink-0 text-champagne" aria-hidden />
              <label htmlFor="ar-scale" className="sr-only">Product size</label>
              <input
                id="ar-scale"
                type="range"
                min={22}
                max={85}
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
                className="h-1 flex-1 accent-[#c8a96a]"
              />
              <button
                type="button"
                onClick={() => {
                  setScale(52);
                  setPosition({ x: 50, y: 56 });
                }}
                className="inline-flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.1em] text-ivory/70 hover:text-ivory"
              >
                <RotateCcw className="size-3" aria-hidden />
                Reset
              </button>
            </div>
          </div>

          <p className="mx-auto w-full max-w-4xl pt-3 text-center text-[9px] leading-relaxed text-ivory/45">
            The camera stays on your device and is never uploaded. This is a size-and-placement
            preview; colours may vary in natural light.
          </p>
        </div>
      ) : null}
    </>
  );
}
