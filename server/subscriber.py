import asyncio

QUEUE_MAX = 40


class Subscriber:
    def __init__(self) -> None:
        self.pending_frames: asyncio.Queue = asyncio.Queue(maxsize=QUEUE_MAX)

    def enqueue_frame_dropping_oldest_if_full(self, payload: str) -> None:
        """Push a frame, discarding the oldest if the client is behind."""
        while True:
            try:
                self.pending_frames.put_nowait(payload)
                return
            except asyncio.QueueFull:
                try:
                    self.pending_frames.get_nowait()
                except asyncio.QueueEmpty:
                    return
