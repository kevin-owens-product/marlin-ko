import { useRef, useCallback, useState } from "react";

export interface ColumnDef {
  key: string;
  minWidth?: number;
  initialWidth?: number;
}

export function useColumnResize(columns: ColumnDef[]) {
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const col of columns) {
      if (col.initialWidth) {
        initial[col.key] = col.initialWidth;
      }
    }
    return initial;
  });

  const dragState = useRef<{
    key: string;
    startX: number;
    startWidth: number;
    minWidth: number;
  } | null>(null);

  const onMouseDown = useCallback(
    (key: string, minWidth: number, e: React.MouseEvent) => {
      e.preventDefault();
      const th = (e.target as HTMLElement).parentElement;
      if (!th) return;
      const startWidth = th.offsetWidth;
      dragState.current = { key, startX: e.clientX, startWidth, minWidth };

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragState.current) return;
        const diff = ev.clientX - dragState.current.startX;
        const newWidth = Math.max(dragState.current.minWidth, dragState.current.startWidth + diff);
        setWidths((prev) => ({ ...prev, [dragState.current!.key]: newWidth }));
      };

      const onMouseUp = () => {
        dragState.current = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [],
  );

  return { widths, onMouseDown };
}
