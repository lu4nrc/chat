import React, { useEffect, useState } from "react";


import api from "../../services/api";

import toastError from "../../errors/toastError";

import TransmissionModal from "../../components/TransmissionModal";
import { useToast } from "@/hooks/use-toast";


const Transmission = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false);
  const [transmissionId, setTransmissionId] = useState(null);
  const [sendLoading, setSendLoading] = useState(false);

  const [transmissions, setTransmissions] = useState([]);
  const [transmissionModalOpen, setTransmissionModalOpen] = useState(false);
  const [transmissionEdit, setTransmissionEdit] = useState(null);
  const fetchContacts = async () => {
    try {
      const { data } = await api.get("/transmission/");
      setTransmissions(data);
      setLoading(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };
  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  const handleOpenTransmissionModal = () => {
    setTransmissionModalOpen(true);
  };

  const handleCloseTransmissionModal = () => {
    setTransmissionModalOpen(false);
    setTransmissionEdit(null);
    fetchContacts();
  };

  const handleEditTransmission = (transmission) => {
    setTransmissionEdit(transmission);
    setTransmissionModalOpen(true);
  };
  const deleteTransmission = async (id) => {
    try {
      await api.delete(`/transmission/${id}`);
      toast.success("Lista de transmissão deletada com sucesso", {
        style: {
          backgroundColor: "#D4EADD",
          color: "#64A57B",
        },
      });
      fetchContacts();
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };
  const sendTransmission = async (id) => {
    setSendLoading(true);
    setTransmissionId(id);
    try {
      var contactsErr = await api.post(`/transmission/send/${id}`);
      if (contactsErr?.length > 0) {
        toast.success(`Envio de mensagens com sucesso`, {
          style: {
            backgroundColor: "#D4EADD",
            color: "#64A57B",
          },
        });
        toast.info(
          contactsErr?.length > 1
            ? `Falha ao enviar para os seguintes contatos ${contactsErr}`
            : `Falha ao enviar para o seguinte contato ${contactsErr}`,
          {
            autoClose: false,
            closeOnClick: false,
          }
        );
      } else {
        toast.success("Mensagens enviadas com sucesso", {
          style: {
            backgroundColor: "#D4EADD",
            color: "#64A57B",
          },
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
    setSendLoading(false);
    setTransmissionId(null);
  };

  useEffect(() => {}, [transmissionEdit]);

  return (
    <>
      
      {/* <Stack p={2} spacing={2} overflow={"hidden"}>
        <TransmissionModal
          open={transmissionModalOpen}
          onClose={handleCloseTransmissionModal}
          aria-labelledby="form-dialog-title"
          transmission={transmissionEdit}
        ></TransmissionModal>

        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography variant="h5">Listas de transmissão</Typography>

          <button onClick={handleOpenTransmissionModal}>
            Nova transmissão
          </button>
        </Stack>

        <TableContainer sx={{ maxHeight: `calc(100vh - 85px)` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Nome da transmissão</TableCell>
                <TableCell align="center">Quantidade de contatos</TableCell>
                <TableCell align="center">Data de criação</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {transmissions.map((transmission) => (
                  <TableRow key={transmission.id}>
                    <TableCell style={{ paddingRight: 0 }}>
                      {<AddAlert />}
                    </TableCell>
                    <TableCell>{transmission.name}</TableCell>
                    <TableCell align="center">
                      {transmission.contacts.length}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(transmission.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditTransmission(transmission)}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(_) => {
                          deleteTransmission(transmission.id);
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => sendTransmission(transmission.id)}
                      >
                        {sendLoading && transmissionId === transmission.id ? (
                          <CircularProgress size={23} />
                        ) : (
                          <Send />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton avatar columns={3} />}
              </>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>{" "} */}
     
    </>
  );
};

export default Transmission;
