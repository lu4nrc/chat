import React, { useEffect } from "react";
import { toast } from "react-toastify";

import Add from "@mui/icons-material/Add";
import {
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { PencilSimpleLine, Trash } from "@phosphor-icons/react";
import TagModal from "../../components/TagModal";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const Tags = () => {
  const theme = useTheme();
  const [userstag, setUserTags] = React.useState([]);
  const [enterprisestags, setEnterprisesTags] = React.useState([]);
  const [customstags, setCustomTags] = React.useState([]);
  const [tagOpen, setTagOpen] = React.useState(false);
  const [v, setV] = React.useState(null);

  const handleCloseTag = async () => {
    setTagOpen(false);

    try {
      const result = await api.get("tags");
      setUserTags(result.data.tags.filter((x) => x?.typetag === "user") || []);
      setEnterprisesTags(
        result.data.tags.filter((x) => x?.typetag === "enterprise") || []
      );
      setCustomTags(
        result.data.tags.filter((x) => x?.typetag === "custom") || []
      );
    } catch (err) {
      toastError(err);
    }

    setV(null);
  };

  const handleEditTag = (value) => {
    setV(value);
    setTagOpen(true);
  };

  useEffect(() => {}, [v]);

  const handleDeleteTag = async (id) => {
    try {
      await api.delete(`/tags/${id}`).then(() => loadTags());
      toast.success("Tag deletada", {
        style: {
          backgroundColor: "#D4EADD",
          color: "#64A57B",
        },
      });
    } catch (err) {
      toastError(err);
    }
  };

  const TagItem = ({ value }) => {
    return (
      <Stack direction={"row"} justifyContent={"space-between"} width={"100%"}>
        <Chip
          label={value.name}
          className={
            value.typetag === "user"
              ? "classes.chipUser"
              : value.typetag === "enterprise"
              ? "classes.chipEnterprise "
              : "classes.chipCustom"
          }
        />

        <Stack direction={"row"} spacing={0.5}>
          <IconButton
            onClick={() => {
              handleEditTag(value);
            }}
          >
            <PencilSimpleLine size={18} />
          </IconButton>
          <IconButton onClick={() => handleDeleteTag(value.id)}>
            <Trash size={18} />
          </IconButton>
        </Stack>
      </Stack>
    );
  };
  const loadTags = async () => {
    try {
      const result = await api.get("tags");
      setUserTags(result.data.tags.filter((x) => x?.typetag === "user") || []);
      setEnterprisesTags(
        result.data.tags.filter((x) => x?.typetag === "enterprise") || []
      );
      setCustomTags(
        result.data.tags.filter((x) => x?.typetag === "custom") || []
      );
    } catch (err) {
      toastError(err);
    }
  };
  React.useEffect(() => {
    loadTags();
  }, []);

  return (
    <Stack p={2}>
      <Stack pt={0.5} spacing={2}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography variant="h5">Atendimentos</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setTagOpen(true)}
          >
            <Add /> Adicionar Tag
          </Button>
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <Stack flex={1} spacing={1}>
            <Stack>
              <Typography variant="subtitle1">Usuários</Typography>
              <Typography variant="body2" color={theme.palette.grey[600]}>
                Tags referentes aos usuários do sistema
              </Typography>
            </Stack>

            <Stack
              border={"1px solid gray"}
              borderRadius={1}
              sx={{ height: "calc(100vh - 240px)", overflow: "auto" }}
            >
              <List>
                {userstag.map((value) => (
                  <ListItem key={value.id}>
                    <TagItem value={value} />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Stack>
          <Stack flex={1} spacing={1}>
            <Stack>
              <Typography variant="subtitle1">Empresas</Typography>
              <Typography variant="body2" color={theme.palette.grey[600]}>
                Tags referentes as empresas
              </Typography>
            </Stack>
            <Stack
              border={"1px solid gray"}
              borderRadius={1}
              sx={{ height: "calc(100vh - 240px)", overflow: "auto" }}
            >
              <List>
                {enterprisestags.map((value) => (
                  <ListItem key={value.id}>
                    <TagItem value={value} />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Stack>
          <Stack flex={1} spacing={1}>
            <Stack>
              <Typography variant="subtitle1">Personalizadas</Typography>
              <Typography variant="body2" color={theme.palette.grey[600]}>
                Tags personalizadas
              </Typography>
            </Stack>

            <Stack
              border={"1px solid gray"}
              borderRadius={1}
              sx={{ height: "calc(100vh - 240px)", overflow: "auto" }}
            >
              <List>
                {customstags.map((value) => (
                  <ListItem key={value.id}>
                    <TagItem value={value} />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Stack>

          <TagModal open={tagOpen} onClose={handleCloseTag} value={v} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Tags;
