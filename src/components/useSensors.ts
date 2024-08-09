import { KeyboardEvent, PointerEvent, useMemo, useRef, WheelEvent } from "react";

import { useController } from "./Controller";
import { cssClass } from "../utils";

export default function useSensors() {
  const wheelEvents = useRef<WheelEvent[]>([]);
  const wheelCooldown = useRef<number | null>(null);
  const wheelCooldownMomentum = useRef<number | null>(null);
  const activePointer = useRef<PointerEvent | null>(null);

  const { prev, next, close } = useController();

  return useMemo(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          close();
          break;
        case "ArrowLeft":
          prev();
          break;
        case "ArrowRight":
          next();
          break;
        default:
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!activePointer.current) {
        event.persist();
        activePointer.current = event;
      } else {
        // cancel multi-touch gestures
        activePointer.current = null;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId === activePointer.current?.pointerId) {
        const dx = event.clientX - activePointer.current.clientX;
        const deltaX = Math.abs(dx);
        const deltaY = Math.abs(event.clientY - activePointer.current.clientY);

        if (deltaX > 50 && deltaX > 1.2 * deltaY) {
          if (dx > 0) {
            prev();
          } else {
            next();
          }
        } else if (
          (deltaY > 50 && deltaY > 1.2 * deltaX) ||
          (activePointer.current.target instanceof HTMLElement &&
            activePointer.current.target.className.split(" ").includes(cssClass("slide")))
        ) {
          close();
        }

        activePointer.current = null;
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (wheelCooldown.current && wheelCooldownMomentum.current) {
        if (
          event.deltaX * wheelCooldownMomentum.current > 0 &&
          (event.timeStamp <= wheelCooldown.current + 500 ||
            (event.timeStamp <= wheelCooldown.current + 1_000 &&
              Math.abs(event.deltaX) < 1.2 * Math.abs(wheelCooldownMomentum.current)))
        ) {
          wheelCooldownMomentum.current = event.deltaX;
          return;
        }

        wheelCooldown.current = null;
        wheelCooldownMomentum.current = null;
      }

      event.persist();
      wheelEvents.current = wheelEvents.current.filter((e) => e.timeStamp > event.timeStamp - 3_000);
      wheelEvents.current.push(event);

      const dx = wheelEvents.current.map((e) => e.deltaX).reduce((a, b) => a + b, 0);
      const deltaX = Math.abs(dx);
      const deltaY = Math.abs(wheelEvents.current.map((e) => e.deltaY).reduce((a, b) => a + b, 0));

      if (deltaX > 100 && deltaX > 1.2 * deltaY) {
        if (dx < 0) {
          prev();
        } else {
          next();
        }

        wheelEvents.current = [];
        wheelCooldown.current = event.timeStamp;
        wheelCooldownMomentum.current = event.deltaX;
      }
    };

    return {
      onKeyDown,
      onPointerDown,
      onPointerUp,
      onPointerLeave: onPointerUp,
      onPointerCancel: onPointerUp,
      onWheel,
    };
  }, [prev, next, close]);
}
