import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import experienceImg from "../../assets/experience.png";
import performance from "../../assets/performance.png";
import security from "../../assets/security.png";
const steps = [
  {
    label: "Melhoria na experiência do usuário",
    description: `Na busca contínua pela excelência, nossa última atualização foca em aprimorar cada interação, proporcionando uma experiência do usuário mais fluida, intuitiva e gratificante do que nunca.`,
  },
  {
    label: "Desempenho Aprimorado",
    description:
      "Experimente a potência da inovação com nosso Desempenho Aprimorado na nova versão do sistema, garantindo uma execução mais ágil e eficiente para elevar sua jornada digital a patamares excepcionais.",
  },
  {
    label: "Segurança da Informação",
    description: `Na vanguarda da proteção digital, a nova versão do nosso sistema eleva a segurança da informação a patamares inéditos, proporcionando uma barreira impenetrável contra ameaças cibernéticas e garantindo a integridade dos seus dados.`,
  },
];
const NewsModal = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isLargeScreen = screenWidth >= 992;

  return isLargeScreen ? (
    <Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
      <DialogContent style={{ padding: 0 }}>
        <Paper elevation={0}>
          <Grid
            container
            component="main"
            sx={{
              width: 800,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Grid
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "500px",
                backgroundImage: `url(${
                  activeStep === 0
                    ? experienceImg
                    : activeStep === 1
                    ? performance
                    : security
                })`,
                backgroundSize: "contain",
                backgroundPosition: "left",
                backgroundRepeat: "no-repeat",
              }}
              item
              xs={6}
              sm={6}
              md={6}
              elevation={0}
            ></Grid>

            <Grid item xs={6} sm={6} md={6}>
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "500px",
                }}
                p={3}
              >
                <Box sx={{ height: "100%" }}>
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel>{step.label}</StepLabel>
                        <StepContent>
                          <Typography>{step.description}</Typography>
                          <Box sx={{ mb: 2 }}>
                            <div>
                              <Button
                                variant="contained"
                                onClick={
                                  index === steps.length - 1
                                    ? onClose
                                    : handleNext
                                }
                                sx={{ mt: 1, mr: 1 }}
                              >
                                {index === steps.length - 1
                                  ? "Finalizar"
                                  : "Continuar"}
                              </Button>
                              <Button
                                disabled={index === 0}
                                onClick={handleBack}
                                sx={{ mt: 1, mr: 1 }}
                              >
                                Voltar
                              </Button>
                            </div>
                          </Box>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>
    </Dialog>
  ) : null;
};

export default NewsModal;
