import React, { useEffect } from "react";
import { Button } from "../ui/button";

import { useToast } from "@/hooks/use-toast";

const LocationPreview = ({ image, link, description }) => {
  const { toast } = useToast()

  useEffect(() => {}, [image, link, description]);

  const handleLocation = async () => {
    try {
      window.open(link);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
    }
  };

  return (
    <>
      <div
        style={{
          minWidth: "250px",
        }}
      >
        <div>
          <div style={{ float: "left" }}>
            <img
              src={image}
              onClick={handleLocation}
              style={{ width: "100px" }}
              alt=" "
            />
          </div>
          {description && (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <p
                style={{
                  marginTop: "12px",
                  marginLeft: "15px",
                  marginRight: "15px",
                  float: "left",
                }}
                variant="subtitle1"
                color="primary"
                gutterBottom
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: description.replace("\\n", "<br />"),
                  }}
                ></div>
              </p>
            </div>
          )}
          <div style={{ display: "block", content: "", clear: "both" }}></div>
          <div>
            <Button onClick={handleLocation} disabled={!link}>
              Visualizar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationPreview;
