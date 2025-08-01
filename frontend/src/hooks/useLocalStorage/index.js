import { useState } from "react";



export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
  
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      const errorMsg =
      error.response?.data?.message || error.response.data.error;
/*     toast({
      variant: "destructive",
      title: errorMsg,
    }); */
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      const errorMsg =
      error.response?.data?.message || error.response.data.error;
/*     toast({
      variant: "destructive",
      title: errorMsg,
    }); */
    }
  };

  return [storedValue, setValue];
}
