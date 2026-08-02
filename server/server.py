"""
uvicorn server.server:app --host 0.0.0.0 --port 8081
"""

import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from .subscriber import Subscriber
from .timeline import Tick, Timeline

subs: set[Subscriber] = set()


def broadcast(tk: Tick) -> None:
    payload = json.dumps({"ts": tk.ts.tolist(), "id": tk.ids.tolist(), "v": tk.vals.tolist()})
    for sub in subs:
        sub.enqueue_frame_dropping_oldest_if_full(payload)


@asynccontextmanager
async def lifespan(app: FastAPI):
    timeline = Timeline("data_replay.h5")
    timeline.start(broadcast)
    yield
    await timeline.stop()


app = FastAPI(title="PER Log Replay", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


@app.get("/stream")
async def stream(request: Request) -> EventSourceResponse:
    sub = Subscriber()
    subs.add(sub)

    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                payload = await sub.pending_frames.get()
                yield {"data": payload}
        finally:
            subs.discard(sub)

    return EventSourceResponse(gen())
