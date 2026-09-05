import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Speedometer from './TorqueTracking.tsx'
import './index.css'

const SERVER_ENDPOINT = "https://bug-free-doodle-gvwqxgjqgpxhvrp4-8081.app.github.dev/stream";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Speedometer serverEndpoint={SERVER_ENDPOINT} />
  </StrictMode>,
)