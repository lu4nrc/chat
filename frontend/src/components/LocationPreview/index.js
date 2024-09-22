import React, { useEffect } from "react";
import { Button } from "../ui/button";

import { useToast } from "@/hooks/use-toast";
import toastError from "@/errors/toastError";

const LocationPreview = ({ image, link, description }) => {
  const { toast } = useToast();

  useEffect(() => {}, [image, link, description]);

  const handleLocation = async () => {
    try {
      window.open(link);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  return (
    <div className="flex  p-2 gap-2 items-center justify-center">
      <img
        src={image}
        onClick={handleLocation}
        className="rounded-full h-14"
        alt=" "
      />

      <div className="flex flex-col">
        {description && (
          <p className="text-xs">
            <span
              dangerouslySetInnerHTML={{
                __html: description.replace("\\n", "<br />"),
              }}
            ></span>
          </p>
        )}
        <Button className="w-full" onClick={handleLocation} disabled={!link}>
          Visualizar
        </Button>
      </div>
    </div>
  );
};

export default LocationPreview;
