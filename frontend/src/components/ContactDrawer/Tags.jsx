import React, { useEffect, useState } from "react";
import api from "../../services/api";


const Tags = ({ contact }) => {
  const [dataUsers, setDataUsers] = useState([]);
  const [dataEnterprise, setDataEnterprise] = useState([]);
  const [dataCustom, setDataCustom] = useState([]);
  const [, setSelectTag] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.get("tags");
        const tagsUser = result.data.tags.filter((el) => el.typetag === "user");
        const tagsEnterprise = result.data.tags.filter(
          (el) => el.typetag === "enterprise"
        );
        const tagsCustom = result.data.tags.filter(
          (el) => el.typetag === "custom"
        );
        setDataUsers(tagsUser);
        setDataEnterprise(tagsEnterprise);
        setDataCustom(tagsCustom);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSaveContact = async (newValue, type) => {
    const updatedTags = [
      ...contact.tagslist.filter((el) => el.typetag !== type),
      ...newValue,
    ];
    const updatedContact = { ...contact, tagslist: updatedTags };
    try {
      await api.put(`/contacts/${contact.id}`, updatedContact);
    } catch (err) {
      console.error("Error saving contact:", err);
    }
  };

  return (
    <>
    {/*  <Stack spacing={1}>
      {dataUsers ? (
        <Stack>
          <Typography
            variant="subtitle2"
            sx={{ color: "#888E93" }}
            fontWeight="bold"
          >
            Atendentes
          </Typography>
          <Autocomplete
            limitTags={2}
            multiple
            size="small"
            disableCloseOnSelect
            onChange={(event, newValue) => {
              setSelectTag(newValue);
              handleSaveContact(newValue, "user");
            }}
            id="tags-user"
            options={dataUsers}
            getOptionLabel={(option) => option?.name}
            value={contact.tagslist?.filter((el) => el.typetag === "user")}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Pesquisar"
              />
            )}
          />
        </Stack>
      ) : (
        <p>Loading...</p>
      )}
      {dataEnterprise ? (
        <Stack>
          <Typography
            variant="subtitle2"
            sx={{ color: "#888E93" }}
            fontWeight="bold"
          >
            Empresas
          </Typography>
          <Autocomplete
            limitTags={2}
            multiple
            size="small"
            disableCloseOnSelect
            onChange={(event, newValue) => {
              setSelectTag(newValue);
              handleSaveContact(newValue, "enterprise");
            }}
            id="tags-enterprise"
            options={dataEnterprise}
            getOptionLabel={(option) => option?.name}
            value={contact.tagslist?.filter(
              (el) => el.typetag === "enterprise"
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Pesquisar"
              />
            )}
          />
        </Stack>
      ) : (
        <p>Loading...</p>
      )}
      {dataCustom ? (
        <Stack>
          <Typography
            variant="subtitle2"
            sx={{ color: "#888E93" }}
            fontWeight="bold"
          >
            Customizados
          </Typography>
          <Autocomplete
            size="small"
            limitTags={2}
            multiple
            disableCloseOnSelect
            onChange={(event, newValue) => {
              setSelectTag(newValue);
              handleSaveContact(newValue, "custom");
            }}
            id="tags-custom"
            options={dataCustom}
            getOptionLabel={(option) => option?.name}
            value={contact.tagslist?.filter((el) => el.typetag === "custom")}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Pesquisar"
              />
            )}
          />
        </Stack>
      ) : (
        <p>Loading...</p>
      )}
    </Stack> */}
    </>
  );
};

export default Tags;
