import React, { useEffect, useState } from "react";

import ModalImage from "react-modal-image";
import api from "../../services/api";

const ModalImageCors = ({ imageUrl }) => {

  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (!imageUrl) return;
    const fetchImage = async () => {
      try {
        const { data, headers } = await api.get(imageUrl, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers["content-type"] })
        );
        setBlobUrl(url);
        setFetching(false);
      } catch (error) {
        console.error("Error fetching image:", error);
        setFetching(false);
      }
    };
    fetchImage();
  }, [imageUrl]);

  return (
    <div
      className="max-w-[200px] max-h-[250px] overflow-hidden border rounded-lg"
      sx={{
        maxWidth: 200,
        maxHeight: 250,
        overflow: "hidden",
        borderRadius: "8px",
      }}
    >
      <ModalImage
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
        smallSrcSet={fetching ? imageUrl : blobUrl}
        medium={fetching ? imageUrl : blobUrl}
        large={fetching ? imageUrl : blobUrl}
        alt="image"
        loading="eager"
      />
    </div>
  );
};

export default ModalImageCors;
