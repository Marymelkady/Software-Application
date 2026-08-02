import asyncio
import time
from collections.abc import Callable
from pathlib import Path
from typing import cast

import h5py
import numpy as np
from numpy.typing import NDArray
from pydantic import BaseModel, ConfigDict, Field

US_PER_S = 1_000_000
DEFAULT_TICK_TIME_LENGTH_US = 50_000
END_OF_RUN_LOOP_PAUSE_S = 10


class Tick(BaseModel):
    model_config = ConfigDict(frozen=True, arbitrary_types_allowed=True)

    ts: NDArray[np.uint64] = Field(description="Timestamps of the samples in the tick in microseconds")
    ids: NDArray[np.uint16] = Field(description="The ID of each sample")
    vals: NDArray[np.float64] = Field(description="Sample values")

    def __len__(self) -> int:
        return int(self.ts.size)


class Timeline:
    def __init__(self, path: str | Path, tick_length_us: int = DEFAULT_TICK_TIME_LENGTH_US):
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"replay file not found: {path}\n")

        with h5py.File(path, "r") as h5_file:
            timestamps_us = cast(h5py.Dataset, h5_file["timeline/t"])[:].astype(np.uint64)
            timestamps_us -= timestamps_us[0]

            sample_ids = cast(h5py.Dataset, h5_file["timeline/id"])[:].astype(np.uint16)
            sample_vals = cast(h5py.Dataset, h5_file["timeline/v"])[:].astype(np.float64)

        self.tick_length_us = tick_length_us
        tick_boundary_ts = (
            np.arange(1, int(timestamps_us[-1] // self.tick_length_us) + 1) * self.tick_length_us
        )
        split_indices = np.searchsorted(timestamps_us, tick_boundary_ts)
        self.ticks = [
            Tick(ts=ts, ids=ids, vals=vals)
            for ts, ids, vals in zip(
                np.split(timestamps_us, split_indices),
                np.split(sample_ids, split_indices),
                np.split(sample_vals, split_indices),
            )
        ]

        self._playback_task: asyncio.Task | None = None

    async def _broadcast_ticks_on_schedule(self, broadcast_tick: Callable[[Tick], None]) -> None:
        tick_broadcast_period = self.tick_length_us / US_PER_S
        while True:
            loop_start_wall_time = time.monotonic()
            for tick_index, tick in enumerate(self.ticks, start=1):
                target_wall_time = loop_start_wall_time + tick_index * tick_broadcast_period
                await asyncio.sleep(max(0.0, target_wall_time - time.monotonic()))
                broadcast_tick(tick)
            await asyncio.sleep(END_OF_RUN_LOOP_PAUSE_S)

    def start(self, broadcast_tick: Callable[[Tick], None]) -> None:
        self._playback_task = asyncio.create_task(self._broadcast_ticks_on_schedule(broadcast_tick))

    async def stop(self) -> None:
        if self._playback_task:
            self._playback_task.cancel()
            try:
                await self._playback_task
            except asyncio.CancelledError:
                pass
