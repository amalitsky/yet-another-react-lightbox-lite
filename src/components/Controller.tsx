import { createContext, PropsWithChildren, useMemo, useRef, useState } from "react";

import { useLightboxContext } from "./LightboxContext";
import { makeUseContext, transition } from "../utils";
import { Callback, LightboxProps } from "../types";

type ControllerProps = PropsWithChildren & Pick<LightboxProps, "setIndex">;

type ExitHook = Callback<Promise<void> | void>;

type Transition = "previous" | "next";

type ControllerContextType = {
  close: Callback;
  prev: Callback;
  next: Callback;
  addExitHook: (hook: ExitHook) => Callback;
  upcomingTransition: Transition | undefined;
};

const ControllerContext = createContext<ControllerContextType | null>(null);

export const useController = makeUseContext(ControllerContext);

export default function Controller({ setIndex, children }: ControllerProps) {
  const { slides, index } = useLightboxContext();
  const [upcomingTransition, setUpcomingTransition] = useState<Transition | undefined>(undefined);

  const exitHooks = useRef<ExitHook[]>([]);

  const context = useMemo(() => {
    const prev = () => {
      if (slides.length > 1) {
        setUpcomingTransition("previous");
        const viewTransition = transition(() => setIndex(index === 0 ? slides.length - 1 : index - 1));

        if (viewTransition) {
          viewTransition.finished.finally(() => {
            setUpcomingTransition(undefined);
          });
        } else {
          setUpcomingTransition(undefined);
        }
      }
    };

    const next = () => {
      if (slides.length > 1) {
        setUpcomingTransition("next");

        const viewTransition = transition(() => setIndex(index === slides.length - 1 ? 0 : index + 1));

        if (viewTransition) {
          viewTransition.finished.finally(() => setUpcomingTransition(undefined));
        } else {
          setUpcomingTransition(undefined);
        }
      }
    };

    const close = () => {
      Promise.all(exitHooks.current.map((hook) => hook()))
        .catch(() => {})
        .then(() => {
          exitHooks.current = [];
          setIndex(-1);
        });
    };

    const addExitHook = (hook: ExitHook) => {
      exitHooks.current.push(hook);

      return () => {
        exitHooks.current.splice(exitHooks.current.indexOf(hook), 1);
      };
    };

    return { prev, next, close, addExitHook, upcomingTransition };
  }, [slides.length, index, setIndex, upcomingTransition]);

  return <ControllerContext.Provider value={context}>{children}</ControllerContext.Provider>;
}
