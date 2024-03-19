import React, { useEffect, useState } from "react";

import { Stack, Typography } from "@mui/material";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { toast } from "react-toastify";
import api from "../../services/api";

/* const useStyles = styled((theme) => ({
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
})); */

const QueueSelect = ({ selectedQueueIds, onChange }) => {
  /* const classes = useStyles(); */
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toast.error("Error fetching queues");
      }
    })();
  }, []);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginTop: 6 }}>
      <Stack>
      <Typography  variant="subtitle2">Departamentos</Typography>
        <Select
          multiple
          size="small"
          value={selectedQueueIds}
          onChange={handleChange}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            /* getContentAnchorEl: null, */ /* Verificar error */
          }}
          renderValue={(selected) => (
            <div /* className={classes.chips} */>
              {selected?.length > 0 &&
                selected.map((id) => {
                  const queue = queues.find((q) => q.id === id);
                  return queue ? (
                    <Chip
                      key={id}
                      sx={{ backgroundColor: queue.color }}
                      variant="outlined"
                      label={queue.name}
                      /* className={classes.chip} */
                    />
                  ) : null;
                })}
            </div>
          )}
        >
          {queues.map((queue) => (
            <MenuItem key={queue.id} value={queue.id}>
              {queue.name}
            </MenuItem>
          ))}
        </Select>
      </Stack>
    </div>
  );
};

export default QueueSelect;
