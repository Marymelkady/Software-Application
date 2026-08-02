import { useEffect, useState } from "react";
import SpeedometerGauge, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
  Indicator,
} from "react-speedometer";

// pcm.wheelSpeeds.frontLeft
const FRONT_LEFT_WHEEL_SPEED_SENSOR_ID = 0;
const MAX_SPEED_MPH = 80;

// gauge uses the library's default width/height (250), so radius = 125
const GAUGE_RADIUS = 125;
const INDICATOR_X_POSITION = GAUGE_RADIUS;
const INDICATOR_Y_POSITION = GAUGE_RADIUS + GAUGE_RADIUS / 2 + 10;

type Tick = {
  ts: number[];
  id: number[];
  v: number[];
};

export default function Speedometer(props: { serverEndpoint: string }) {
  const [speedMph, setSpeedMph] = useState(0);

  useEffect(() => {
    const source = new EventSource(props.serverEndpoint);

    source.onmessage = (event) => {
      const tick: Tick = JSON.parse(event.data);
      console.log("tick", tick);
      for (let i = 0; i < tick.id.length; i++) {
        if (tick.id[i] === FRONT_LEFT_WHEEL_SPEED_SENSOR_ID) {
          setSpeedMph(tick.v[i]);
        }
      }
    };

    return () => source.close();
  }, []);

  return (
    <div
      style={{
        height: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a', // near-black backdrop, F1 dashboard feel
      }}
    >
      <SpeedometerGauge
        value={speedMph}
        max={MAX_SPEED_MPH}
        fontFamily="'Arial Narrow', 'Segoe UI', Impact, sans-serif"
        accentColor="#E10600" // F1 racing red
      >
        <Background color="#111111" /> {/* dark plate behind the arc */}
        <Arc color="#2b2b2b" arcWidth={18} lineCap="butt" /> {/* unfilled portion, dark grey*/}
        <Progress color="#E10600" arcWidth={18} lineCap="butt" /> {/* filled portion, bright red */}
        <Needle color="#E10600" circleColor="#f2f2f2" circleRadius={10} strokeLinejoin="miter" /> {/* red needle, light hub so it's visible against the black face */}
        <Marks lineColor="#f2f2f2" fontSize={18} /> {/* off-white ticks/numbers*/}
        {/* React render prop to add custom units */}
        <Indicator fontSize={48} color="#E10600" fontFamily="'Arial Narrow', 'Segoe UI', Impact, sans-serif">
          {(fixedValue, textProps) => (
            <text
              x={INDICATOR_X_POSITION}
              y={INDICATOR_Y_POSITION}
              textAnchor="middle"
              fontSize={48}
              fill="#E10600"
              fontFamily="'Arial Narrow', 'Segoe UI', Impact, sans-serif"
              transform={textProps.transform}
            >
              {fixedValue}
              <tspan x={INDICATOR_X_POSITION} dy="20" fontSize={16} fill="#E10600">mph</tspan>
            </text>
          )}
        </Indicator>

      </SpeedometerGauge>
    </div>
  );
}
