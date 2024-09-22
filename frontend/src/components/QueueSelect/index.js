import React, { useEffect, useState } from "react";


import api from "../../services/api";
import MultipleSelector from "../ui/multiple-selector";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";

const QueueSelect = ({ selectedQueueIds, onChange }) => {
  const [queues, setQueues] = useState(null);
  const [queuesSelected, setQueuesSelected] = useState(selectedQueueIds);
  const toast = useToast()

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);

        setQueuesSelected(queuesSelected);
      } catch (err) {
        toast.error("Error fetching queues");
      }
    })();
  }, []);

  return (
    <div>
      <div className="grid gap-1">
        <Label>Departamentos</Label>

        {queues && (
          <MultipleSelector
            defaultOptions={queues}
            value={queuesSelected}
            onChange={onChange}
            placeholder="Selecionar departamentos ou filas.."
            emptyIndicator={
              <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                Departamento ou fila não encontrado.
              </p>
            }
          />
        )}
      </div>
    </div>
  );
};

export default QueueSelect;
