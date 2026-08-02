import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Speedometer from './Speedometer.tsx'

const SERVER_ENDPOINT = "http://localhost:8081/stream";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Speedometer serverEndpoint={SERVER_ENDPOINT} />
  </StrictMode>,
)
