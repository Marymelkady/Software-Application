import { useEffect, useRef, useState } from "react";

type Tick = {
  ts: number[];
  id: number[];
  v: number[];
};

const REQUESTED_TORQUE_ID = 4;
const FEEDBACK_TORQUE_ID = 5;
const PEDAL_ID = 1;
const VELOCITY_X_ID = 8;

type Point = {
  time: number;
  requested: number;
  feedback: number;
};

export default function Speedometer(props: { serverEndpoint: string }) {
  const [requested, setRequested] = useState(0);
  const [feedback, setFeedback] = useState(0);
  const [pedal, setPedal] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [history, setHistory] = useState<Point[]>([]);

  const latest = useRef({
    requested: 0,
    feedback: 0,
    pedal: 0,
    velocity: 0,
  });

  useEffect(() => {
    const source = new EventSource(props.serverEndpoint);

    source.onmessage = (event) => {
      const tick: Tick = JSON.parse(event.data);

      let timestamp = 0;

      for (let i = 0; i < tick.id.length; i++) {
        const id = tick.id[i];
        const value = tick.v[i];

        timestamp = tick.ts[i] / 1e6;

        if (id === REQUESTED_TORQUE_ID) {
          latest.current.requested = value;
          setRequested(value);
        }

        if (id === FEEDBACK_TORQUE_ID) {
          latest.current.feedback = value;
          setFeedback(value);

          setHistory((previous) => [
            ...previous.slice(-99),
            {
              time: timestamp,
              requested: latest.current.requested,
              feedback: value,
            },
          ]);
        }

        if (id === PEDAL_ID) {
          latest.current.pedal = value;
          setPedal(value);
        }

        if (id === VELOCITY_X_ID) {
          latest.current.velocity = value;
          setVelocity(value);
        }
      }
    };

    return () => source.close();
  }, [props.serverEndpoint]);

  const error = requested - feedback;
  const absoluteError = Math.abs(error);

  const status =
    absoluteError > 40
      ? "LARGE DEVIATION"
      : absoluteError > 15
        ? "CHECK TRACKING"
        : "TRACKING WELL";

  const statusClass =
    absoluteError > 40
      ? "danger"
      : absoluteError > 15
        ? "warning"
        : "good";

  const maxTorque = 130;

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <div className="eyebrow">POWERTRAIN TELEMETRY</div>
          <h1>TORQUE TRACKING</h1>
        </div>

        <div className="live">
          <span className="live-dot" />
          LIVE
        </div>
      </div>

      <div className="main-card">
        <div className="metric-row">
          <div className="metric">
            <span className="label">REQUESTED TORQUE</span>
            <span className="value">{requested.toFixed(1)}</span>
            <span className="unit">Nm</span>
          </div>

          <div className="metric">
            <span className="label">FEEDBACK TORQUE</span>
            <span className="value">{feedback.toFixed(1)}</span>
            <span className="unit">Nm</span>
          </div>

          <div className={`status ${statusClass}`}>
            <span className="status-label">TRACKING STATUS</span>
            <strong>{status}</strong>
          </div>
        </div>

        <div className={`error-display ${statusClass}`}>
          <span>TRACKING ERROR</span>
          <strong>{absoluteError.toFixed(1)} Nm</strong>
        </div>

        <div className="chart">
          <div className="chart-label requested-label">REQUESTED</div>
          <div className="chart-label feedback-label">FEEDBACK</div>

          <svg viewBox="0 0 1000 300" preserveAspectRatio="none">
            <line x1="0" y1="75" x2="1000" y2="75" />
            <line x1="0" y1="150" x2="1000" y2="150" />
            <line x1="0" y1="225" x2="1000" y2="225" />

            {history.length > 1 && (
              <>
                <polyline
                  className="requested-line"
                  points={history
                    .map(
                      (p, i) =>
                        `${(i / 99) * 1000},${300 - (Math.min(p.requested, maxTorque) / maxTorque) * 300}`,
                    )
                    .join(" ")}
                />

                <polyline
                  className="feedback-line"
                  points={history
                    .map(
                      (p, i) =>
                        `${(i / 99) * 1000},${300 - (Math.min(p.feedback, maxTorque) / maxTorque) * 300}`,
                    )
                    .join(" ")}
                />
              </>
            )}
          </svg>
        </div>

        <div className="context-row">
          <div>
            <span>PEDAL</span>
            <strong>{(pedal * 100).toFixed(1)}%</strong>
          </div>

          <div>
            <span>VELOCITY X</span>
            <strong>{velocity.toFixed(1)} m/s</strong>
          </div>

          <div>
            <span>ERROR</span>
            <strong>{error >= 0 ? "+" : ""}{error.toFixed(1)} Nm</strong>
          </div>
        </div>
      </div>

      <div className="legend">
        <span><i className="requested-dot" /> Requested torque</span>
        <span><i className="feedback-dot" /> Feedback torque</span>
      </div>
    </div>
  );
}
