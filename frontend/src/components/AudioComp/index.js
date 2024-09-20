import { Pause, Play } from "@phosphor-icons/react";
import { useWavesurfer } from "@wavesurfer/react";
import { useCallback, useRef, useState } from "react";

/* const formatTime = (seconds) => [seconds / 60, seconds % 60].map((v) => `${Math.floor(v)}`.slice(-2)).join(':') */

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
};

const AudioComp = ({ audio }) => {
  const containerRef = useRef(null);

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: audio,
    width: "100%",
    
    barWidth: 2,
    barRadius: 2,
    autoScroll: false,
    audioRate: 1,
    barGap: 2,
    height: 30,
    cursorWidth: 2,
    waveColor: "#cacaca",
    progressColor: "#FF2661",
  });

  const onPlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause();
  }, [wavesurfer]);

  return (
    <div className="flex justify-between items-center gap-1 px-1">
      <div onClick={onPlayPause}>
        {isPlaying ? <Pause size={22} /> : <Play size={22} />}
      </div>
      <div ref={containerRef} className="min-w-32 w-full h-8"/>

      <span className="text-xs font-semibold" >
        {isPlaying
          ? formatTime(currentTime)
          : formatTime(
              currentTime > 0 ? currentTime : wavesurfer?.decodedData?.duration
            )}
        {}
      </span>
    </div>
  );
};

export default AudioComp;
