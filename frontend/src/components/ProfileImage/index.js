import { CameraAlt } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import React, { createRef, useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const ProfileImage = ({ user }) => {
  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");

  const [image, _setImage] = useState(null);
  const inputFileRef = createRef(null);

  const cleanup = () => {
    URL.revokeObjectURL(image);
    inputFileRef.current.value = null;
  };

  const setImage = (newImage) => {
    if (image) {
      cleanup();
    }
    _setImage(newImage);
  };

  const handleOnChange = (event) => {
    const newImage = event.target?.files?.[0];
    if (newImage) {
      setImage(URL.createObjectURL(newImage));
      updateImage(newImage);
    }
  };

  const updateImage = async (image) => {
    const formData = new FormData();
    formData.append("fileupload", image);
    try {
      await api.put(`/users/image/${user.id}`, formData);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    if (!user.imageUrl) return;
    const fetchImage = async () => {
      const { data, headers } = await api.get(`/public/${user.imageUrl}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([data], { type: headers["content-type"] })
      );
      setBlobUrl(url);
      setFetching(false);
    };
    fetchImage();
  }, [user.imageUrl]);

  return (
    <>
      <label htmlFor="avatar-image-upload">
        <Avatar
          component="label"
          htmlFor="avatar-image-upload"
          alt="Avatar"
          src={fetching ? image : image || blobUrl}
          imgProps={{
            style: {
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "cover",
            },
          }}
        >
          <CameraAlt />
        </Avatar>

        <input
          ref={inputFileRef}
          accept="image/*"
          hidden
          id="avatar-image-upload"
          type="file"
          onChange={handleOnChange}
        />
      </label>
    </>
  );
};

export default ProfileImage;
