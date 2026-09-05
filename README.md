cat > example/README.md <<'EOF'
# Torque Tracking Monitor

A real-time telemetry widget for comparing requested motor torque with motor torque feedback.

The widget calculates the difference between commanded and measured torque and visualizes both signals over time. It also provides accelerator pedal position and velocity as context when a tracking deviation occurs.
