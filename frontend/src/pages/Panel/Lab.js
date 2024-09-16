import { Button } from "@/components/ui/button";
import { Toast, ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import React, { useReducer, useState } from "react";

const Lab = () => {
  const [count, setCount] = useState(0);
  const { toast } = useToast()

  const initialState = {
    count: 0,
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case "decrement":
        return { count: state.count - 1 };
      case "increment":
        return { count: state.count + 1 };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="flex gap-2 p-2">
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: "Scheduled: Catch up ",
            description: "Friday, February 10, 2023 at 5:57 PM",
            action: (
              <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
            ),
          });
        }}
      >
        Add to calendar
      </Button>
      <div className="flex gap-2">
        <button
          className="bg-muted font-medium text-xs px-2 py-1 rounded-sm"
          onClick={() => dispatch({ type: "decrement" })}
        >
          Decrement - R
        </button>
        {state.count}
        <button
          className="bg-muted font-medium text-xs px-2 py-1 rounded-sm"
          onClick={() => dispatch({ type: "increment" })}
        >
          Increment - R
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className="bg-primary text-white font-medium text-xs px-2 py-1 rounded-sm"
          onClick={() => setCount((prev) => prev - 1)}
        >
          Decrement - S
        </button>
        {count}
        <button
          className="bg-primary text-white font-medium text-xs px-2 py-1 rounded-sm"
          onClick={() => setCount((prev) => prev + 1)}
        >
          Increment - S
        </button>
      </div>
    </div>
  );
};

export default Lab;
