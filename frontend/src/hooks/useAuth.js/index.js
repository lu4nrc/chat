import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { useToast } from "../use-toast";
import toastError from "@/errors/toastError";

var interval = null;
const useAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  
  // Setup interceptors
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
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
          return api(originalRequest);
        }
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
    if (token) {
      (async () => {
        try {
          const { data } = await api.post("/auth/refresh_token");
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          setIsAuth(true);
          setUser(data.user);
        } catch (err) {
          toast({
            variant: "destructive",
            title: toastError(err),
          });
        }
        setLoading(false);
      })();
    } else {
      setLoading(false); // Ensure loading state is set to false when no token is found
    }
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
      });
      navigate("/tickets");
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    } finally {
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
      navigate("/login");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Ops, Algo deu errado!",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      const intervalInMilliseconds = 8 * 60 * 60 * 1000; // 8 horas
      interval = setInterval(async () => {
        await api.put(`/users/time/${user.id}`);
      }, intervalInMilliseconds);
    }
    return () => clearInterval(interval); // Clear interval on component unmount
  }, [user.id]);

  return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
