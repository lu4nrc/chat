/* eslint-disable react/react-in-jsx-scope */
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import React, { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import AttendentsImg from "../../assets/Login-bro.png";

function Login() {
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useContext(AuthContext);
  const theme = useTheme();
  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };
  const backgroundImg = {
    backgroundImage: `url(${AttendentsImg})`,
    backgroundSize: "contain",
    backgroundPosition: "left",
  };

  return (
    <Grid
      container
      component="main"
      style={{ ...backgroundImg, backgroundRepeat: "no-repeat" }}
      justifyContent="flex-end"
    >
      <CssBaseline />
      <Grid
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
        item
        xs={0}
        sm={0}
        md={6}
        elevation={0}
      ></Grid>

      <Grid item xs={12} sm={12} md={4} px={2}>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <Box
            p={3}
            borderRadius={2}
            style={{
              display: "flex",
              height: "500px",
              flexDirection: "column",
              alignItems: "start",
              justifyContent: "center",
              // backgroundColor: "#ffff",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
            bgcolor={theme.palette.background.paper}
          >
            <Typography component="h1" variant="h5">
              Olá! bem vindo de volta
            </Typography>
            <Typography component="h1" variant="body1" mb={3}>
              faça login com os dados que você inseriu
              <br />
              durante seu registro.
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              style={{ mt: 10, maxWidth: 320 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                placeholder={i18n.t("login.form.email")}
                value={user.email}
                onChange={handleChangeInput}
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                placeholder={i18n.t("login.form.password")}
                value={user.password}
                onChange={handleChangeInput}
                id="password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((e) => !e)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                color="primary"
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                style={{
                  marginTop: 3,
                  marginBottom: 2,
                  padding: 10,
                  borderRadius: 9,
                }}
              >
                Entrar
              </Button>
              <Grid item xs mt={1}>
                <Link
                  href="#"
                  variant="body2"
                  component={RouterLink}
                  to="/reset/pass"
                >
                  Esqueceu sua senha, recupere aqui.
                </Link>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Login;
