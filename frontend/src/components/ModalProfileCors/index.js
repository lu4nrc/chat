import React, { useEffect, useState } from "react";
import ModalImage from "react-modal-image";
import api from "../../services/api";
import { Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

const ModalProfileCors = ({ imageUrl, size = "small" }) => {
  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (!imageUrl) return;
    const fetchImage = async () => {
      try {
        const { data, headers } = await api.get(`/public/uploads/${imageUrl}`, {
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

  const avatarSizes = {
    small: "h-10 w-10",
    medium: "h-16 w-16",
    large: "h-24 w-24",
  };

  return (
    <Avatar className={cn(avatarSizes[size])}>
      <AvatarImage src={fetching ? imageUrl : blobUrl} alt="@contact" />
      <AvatarFallback>
        <Smile className="text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
};

export default ModalProfileCors;
