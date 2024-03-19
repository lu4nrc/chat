import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

const TimerCustom = ({ startDate }) => {
  const [timeDiff, setTimeDiff] = useState({ hours: "00", minutes: "00" });

  useEffect(() => {
    const firstExec = () => {
      const start = new Date(startDate);
      const current = new Date();
      const timeDiff = Math.abs(current.getTime() - start.getTime());
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((timeDiff / (1000 * 60)) % 60)
        .toString()
        .padStart(2, "0");
      setTimeDiff({ hours, minutes });
    };
    firstExec();
    const interval = setInterval(() => {
      const start = new Date(startDate);
      const current = new Date();
      const timeDiff = Math.abs(current.getTime() - start.getTime());
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((timeDiff / (1000 * 60)) % 60)
        .toString()
        .padStart(2, "0");
      setTimeDiff({ hours, minutes });
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [startDate]);

  return (
    <>
      <Stack spacing={0.5} direction={"row"}>
        {timeDiff.hours > 0 ? (
          <Box sx={{ display: "flex" }}>
            <Typography variant="subtitle1">{timeDiff.hours} </Typography>
            <Typography variant="subtitle2"> H</Typography>
          </Box>
        ) : (
          ""
        )}
        <Box sx={{ display: "flex" }}>
          <Typography variant="subtitle1">{timeDiff.minutes} </Typography>
          <Typography variant="subtitle2"> Min</Typography>
        </Box>
      </Stack>
    </>
  );
};

export default TimerCustom;
