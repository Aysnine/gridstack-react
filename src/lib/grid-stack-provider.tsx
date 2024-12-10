import type { GridStack, GridStackOptions, GridStackWidget } from "gridstack";
import { type PropsWithChildren, useCallback, useState } from "react";
import { GridStackContext } from "./grid-stack-context";

export function GridStackProvider({
  children,
  initialOptions,
}: PropsWithChildren<{ initialOptions: GridStackOptions }>) {
  const [gridStack, setGridStack] = useState<GridStack | null>(null);
  const [rawContentMap, setRawContentMap] = useState(() => {
    const map = new Map<string, string>();
    const deepFindNodeWithContent = (obj: GridStackWidget) => {
      if (obj.id && obj.content) {
        map.set(obj.id, obj.content);
      }
      if (obj.subGridOpts?.children) {
        obj.subGridOpts.children.forEach((child: GridStackWidget) => {
          deepFindNodeWithContent(child);
        });
      }
    };
    initialOptions.children?.forEach((child: GridStackWidget) => {
      deepFindNodeWithContent(child);
    });
    return map;
  });

  const addWidget = useCallback(
    (fn: (id: string) => Omit<GridStackWidget, "id">) => {
      const newId = `widget-${Math.random().toString(36).substring(2, 15)}`;
      const widget = fn(newId);
      gridStack?.addWidget({ ...widget, id: newId });
      setRawContentMap((prev) => {
        const newMap = new Map<string, string>(prev);
        newMap.set(newId, widget.content || "");
        return newMap;
      });
    },
    [gridStack]
  );

  // WIP
  const addSubGrid = useCallback(
    (
      fn: (
        id: string,
        withWidget: (w: Omit<GridStackWidget, "id">) => GridStackWidget
      ) => Omit<GridStackWidget, "id">
    ) => {
      const newId = `sub-grid-${Math.random().toString(36).substring(2, 15)}`;
      const subWidgetIds = [];

      const widget = fn(newId, (w) => {
        const subWidgetId = `widget-${Math.random()
          .toString(36)
          .substring(2, 15)}`;
        subWidgetIds.push(subWidgetId);
        return { ...w, id: subWidgetId };
      });

      gridStack?.addWidget({ ...widget, id: newId });

      setRawContentMap((prev) => {
        const newMap = new Map<string, string>(prev);
        newMap.set(newId, widget.content || "");
        return newMap;
      });
    },
    [gridStack]
  );

  const removeWidget = useCallback(
    (id: string) => {
      gridStack?.removeWidget(id);
      setRawContentMap((prev) => {
        const newMap = new Map<string, string>(prev);
        newMap.delete(id);
        return newMap;
      });
    },
    [gridStack]
  );

  const saveOptions = useCallback(() => {
    return gridStack?.save(true, true, (_, widget) => widget);
  }, [gridStack]);

  return (
    <GridStackContext.Provider
      value={{
        initialOptions,
        gridStack,

        addWidget,
        removeWidget,
        addSubGrid,
        saveOptions,

        _gridStack: {
          value: gridStack,
          set: setGridStack,
        },
        _rawContentMap: {
          value: rawContentMap,
          set: setRawContentMap,
        },
      }}
    >
      {children}
    </GridStackContext.Provider>
  );
}