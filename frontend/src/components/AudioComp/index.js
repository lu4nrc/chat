import { Box, IconButton, Typography} from "@mui/material";
import { Pause, Play } from "@phosphor-icons/react";
import { useWavesurfer } from "@wavesurfer/react";
import { useCallback, useRef, useState } from "react";

/* const formatTime = (seconds) => [seconds / 60, seconds % 60].map((v) => `${Math.floor(v)}`.slice(-2)).join(':') */

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
};

const AudioComp = ({ audio }) => {
  const containerRef = useRef(null)



  const { wavesurfer, isPlaying, currentTime,  } = useWavesurfer({
    container: containerRef,
    url: audio,
    width: 125,
    barWidth:2,
    barRadius:2,
    autoScroll:false,
    audioRate:1,
    barGap:2,
    height:30,
    cursorWidth:2,
    waveColor: '#cacaca',
    progressColor: "#FF2661"
  })

  const onPlayPause = useCallback(() => {
    wavesurfer && wavesurfer.playPause()
  }, [wavesurfer])

  return (
    <Box display={"flex"} paddingRight={2.5} justifyContent={"center"} alignItems={"center"}>
      <IconButton onClick={onPlayPause}>
        {isPlaying ? <Pause size={22} /> : <Play size={22} />}
      </IconButton>
      <div ref={containerRef} />

      <Box>
        <span style={{fontSize: "12px", fontWeight: 700}}>{isPlaying ? formatTime(currentTime) : formatTime(currentTime > 0 ? currentTime : wavesurfer?.decodedData?.duration)}{}</span>
      </Box>
    </Box>
  );
};

export default AudioComp;
