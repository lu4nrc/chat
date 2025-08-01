
import { Stack } from "@phosphor-icons/react";
import React, { useState } from "react";
import { i18n } from "../../translate/i18n";

const TicketsQueueSelect = ({
  userQueues,
  selectedQueueIds = [],
  onChange,
  height,
}) => {
  const [open, setOpen] = useState(false);

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
  {/*     <IconButton onClick={handleClickOpen} color="primary">
      <Stack size={24} />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Selecionar Filas</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <Select
              multiple
              displayEmpty
              variant="outlined"
              value={selectedQueueIds}
              onChange={handleChange}
              style={{ borderRadius: 10, fontSize: 10 }}
              MenuProps={{
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
               
              }}
              renderValue={() => i18n.t("ticketsQueueSelect.placeholder")}
            >
              {userQueues?.length > 0 &&
                userQueues.map((queue) => (
                  <MenuItem
                    dense
                    key={queue.id}
                    value={queue.id}
                    style={{ borderRadius: 10 }}
                  >
                    <Checkbox
                      style={{
                        color: queue.color,
                      }}
                      size="small"
                      color="primary"
                      checked={selectedQueueIds.indexOf(queue.id) > -1}
                    />
                    <ListItemText primary={queue.name} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleClose}>Ok</Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default TicketsQueueSelect;
