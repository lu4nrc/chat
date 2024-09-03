import React, { useEffect } from "react";
import toastError from "../../errors/toastError";
import { Button } from "../ui/button";

const LocationPreview = ({ image, link, description }) => {
  useEffect(() => {}, [image, link, description]);

  const handleLocation = async () => {
    try {
      window.open(link);
    } catch (err) {
      toastError(err);
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
            <Button  onClick={handleLocation} disabled={!link}>
              Visualizar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationPreview;
