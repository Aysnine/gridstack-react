import { useEffect, useState } from "react";

import "./demo.css";

import {
  GridStackHandleReInitializer,
  GridStackItem,
  GridStackProvider,
  GridStackRender,
  useGridStackContext,
} from "./lib";
import { GridStackOptions, GridStackWidget } from "gridstack";
import {
  BREAKPOINTS,
  CELL_HEIGHT,
  CUSTOM_DRAGGABLE_HANDLE_CLASSNAME,
  defaultGridOptions,
} from "./defaultGridOptions";
import { COMPONENT_MAP, ComponentInfo } from "./componentMap";

export default function App() {
  const [uncontrolledInitialOptions] =
    useState<GridStackOptions>(defaultGridOptions);

  const [widgetMapComponentInfo] = useState<Record<string, ComponentInfo>>(
    () => ({
      item3: { component: "Text", serializableProps: { content: "Text" } },
      item4: {
        component: "Button",
        serializableProps: { label: "Click me" },
      },
    })
  );

  return (
    <GridStackProvider initialOptions={uncontrolledInitialOptions}>
      <Toolbar />

      <GridStackRender>
        {/* Simple: Render item with id selector */}
        <GridStackItem id="item1">
          <div>hello</div>
        </GridStackItem>

        <GridStackItem id="item2">
          <div>grid</div>
        </GridStackItem>

        {/* Advanced: Render item with widget map component info */}
        {Object.entries(widgetMapComponentInfo).map(([id, componentInfo]) => {
          const Component = COMPONENT_MAP[componentInfo.component];
          return (
            <GridStackItem key={id} id={id}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Component {...(componentInfo.serializableProps as any)} />
            </GridStackItem>
          );
        })}

        {/* Experimental: Render item with custom handle */}
        <GridStackItem id="item5">
          <GridStackHandleReInitializer>
            <button className={CUSTOM_DRAGGABLE_HANDLE_CLASSNAME}>
              Handle ONLY HERE
            </button>
          </GridStackHandleReInitializer>
        </GridStackItem>
      </GridStackRender>

      <DebugInfo />
    </GridStackProvider>
  );
}

function newId() {
  return `widget-${Math.random().toString(36).substring(2, 15)}`;
}

function Toolbar() {
  const { addWidget } = useGridStackContext();

  return (
    <div
      style={{
        border: "1px solid gray",
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        display: "flex",
        flexDirection: "row",
        gap: "10px",
      }}
    >
      <button
        onClick={() => {
          addWidget({
            id: newId(),
            w: 2,
            h: 2,
            x: 0,
            y: 0,
          });
        }}
      >
        Add Text (2x2)
      </button>

      <button
        onClick={() => {
          addWidget({
            id: newId(),
            h: 5,
            noResize: false,
            sizeToContent: true,
            subGridOpts: {
              acceptWidgets: true,
              columnOpts: { breakpoints: BREAKPOINTS, layout: "moveScale" },
              margin: 8,
              minRow: 2,
              cellHeight: CELL_HEIGHT,
              children: [
                {
                  id: newId(),
                  h: 1,
                  locked: true,
                  noMove: true,
                  noResize: true,
                  w: 12,
                  x: 0,
                  y: 0,
                },
              ],
            },
            w: 12,
            x: 0,
            y: 0,
          });
        }}
      >
        Add Sub Grid (12x1)
      </button>

      <a href="https://github.com/Aysnine/gridstack-react" target="_blank">
        Source Code
      </a>
    </div>
  );
}

function DebugInfo() {
  const { initialOptions, saveOptions } = useGridStackContext();

  const [realtimeOptions, setRealtimeOptions] = useState<
    GridStackOptions | GridStackWidget[] | undefined
  >(undefined);

  useEffect(() => {
    const timer = setInterval(() => {
      if (saveOptions) {
        const data = saveOptions();
        setRealtimeOptions(data);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [saveOptions]);

  return (
    <div>
      <h2>Debug Info</h2>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(2, 1fr)",
        }}
      >
        <div>
          <h3>Initial Options</h3>
          <pre
            style={{
              backgroundColor: "#f3f4f6",
              padding: "1rem",
              borderRadius: "0.25rem",
              overflow: "auto",
            }}
          >
            {JSON.stringify(initialOptions, null, 2)}
          </pre>
        </div>
        <div>
          <h3>Realtime Options (2s refresh)</h3>
          <pre
            style={{
              backgroundColor: "#f3f4f6",
              padding: "1rem",
              borderRadius: "0.25rem",
              overflow: "auto",
            }}
          >
            {JSON.stringify(realtimeOptions, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
