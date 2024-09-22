import React, { useContext, useState } from "react";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { ChevronDown, MessageSquareReply, Trash } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const MessageOptionsMenu = ({ message }) => {
  const [open, setOpen] = useState(false);
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const { toast } = useToast()
  const handleDeleteMessage = async () => {
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  const hanldeReplyMessage = () => {
    setReplyingMessage(message);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} id="messageActionsButton">
      <DropdownMenuTrigger
        className={cn(
          "opacity-0 group-hover:opacity-100 h-6 w-6 rounded-se-lg rounded-bl-lg p-0.5 absolute right-0 top-0 transition-opacity ease-in-out  duration-300",
          message.fromMe ? "bg-background" : "bg-muted"
        )}
      >
        <ChevronDown onClick={() => setOpen(true)} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {message.fromMe && (
          <DropdownMenuItem
            onClick={handleDeleteMessage}
            className="flex gap-2"
          >
            <Trash className="text-red-500 h-4 w-4" /> Apagar
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={hanldeReplyMessage} className="flex gap-2">
          <MessageSquareReply className="h-4 w-4" /> Responder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageOptionsMenu;
