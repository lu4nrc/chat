import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Autocomplete,
  Chip,
  InputAdornment,
  List,
  Stack,
  TextField,
} from "@mui/material";

const AutocompleteAsyncPagination = ({ setUsers, users }) => {
  const [options, setOptions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchContacts = async (searchValue, page) => {
    try {
      const { data } = await api.get("/contacts/", {
        params: { searchParam: searchValue, pageNumber: page },
      });
      if (page === 1) {
        setOptions(data.contacts);
      } else {
        setOptions((prevOptions) => [...prevOptions, ...data.contacts]);
      }
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
    });
    }
  };

  useEffect(() => {
    fetchContacts("", pageNumber);
  }, [pageNumber]);

  const handleAutocompleteChange = (event, newValues) => {
    setUsers(newValues);
  };

  const handleScroll = (event) => {
    const target = event.target;
    if (target.scrollTop + target.clientHeight === target.scrollHeight) {
      if (!loading && hasMore) {
        setPageNumber((prevPageNumber) => prevPageNumber + 1);
        setLoading(true);
      }
    }
  };
  const removeValue = (item) => {
    var array = users;
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }

    setUsers([...array]);
  };
  return (
    <Stack p={2} spacing={2} style={{ maxHeight: "400px", overflowY: "auto" }}>
      <Stack direction={"row"} flexWrap={"wrap"} spacing={0.5}>
        {users.map((value, i) => (
          <Chip
            key={i}
            label={value.name}
            onDelete={() => removeValue(value)}
          />
        ))}
      </Stack>
      <Autocomplete
        multiple
        limitTags={2}
        options={options}
        getOptionLabel={(option) => option.name}
        disableCloseOnSelect
        isOptionEqualToValue={(option, value) => option.id === value.id}
        /* filterOptions={(x) => x} */
        value={users}
        onChange={handleAutocompleteChange}
        onInputChange={(_, value) => {
          fetchContacts(value, 1);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "grey" }} />
                </InputAdornment>
              ),
            }}
          />
        )}
        ListboxComponent={({ children, ...other }) => (
          <List {...other} onScroll={handleScroll}>
            {children}
          </List>
        )}
        /*        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip key={index} label={option.name} {...getTagProps({ index })} />
          ))
        } */
        renderOption={(props, option) => <li {...props}>{option.name}</li>}
      />
    </Stack>
  );
};

export default AutocompleteAsyncPagination;
