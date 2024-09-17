import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import openSocket from "../../services/socket-io";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { useToast } from "../use-toast";

var interval = null;
const useAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
        setIsAuth(true);
      }
      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error?.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        const { data } = await api.post("/auth/refresh_token");
        if (data) {
          localStorage.setItem("token", JSON.stringify(data.token));
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
        }
        return api(originalRequest);
      }
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        api.defaults.headers.Authorization = undefined;
        setIsAuth(false);
        setUser({});
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      if (token) {
        try {
          const { data } = await api.post("/auth/refresh_token");
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          setIsAuth(true);
          setUser(data.user);
        } catch (err) {
          const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("user", (data) => {
      if (data.action === "update" && data.user.id === user.id) {
        clearInterval(interval);
        setUser(data.user);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleLogin = async (userData) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", userData);
      localStorage.setItem("token", JSON.stringify(data.token));
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      setUser(data.user);
      setIsAuth(true);
      toast({
        variant: "success",
        title: i18n.t("auth.toasts.success"),
        //description: "Se até o Domínio Web tem bug, quem sou eu pra não ter? 😅🖥️",
      });
      navigate("/tickets");
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.delete(`/auth/logout/${user.id}`);
      setIsAuth(false);
      setUser({});
      localStorage.removeItem("token");
      api.defaults.headers.Authorization = undefined;
      setLoading(false);
      clearInterval(interval);
      navigate("/login");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Ops, Algo deu errado!",
        //description: "Friday, February 10, 2023 at 5:57 PM",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      const intervalInMilliseconds = 8 * 60 * 60 * 1000; // 8 horas em milissegundos, valor anterior 60000 em segundos 60
      interval = setInterval(async () => {
        await api.put(`/users/time/${user.id}`);
      }, intervalInMilliseconds);
    }
  }, [user.id]);

  return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
