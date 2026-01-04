import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../../context/Auth/AuthContext';

import api from '../../services/api';

import TicketOptionsMenu from '../TicketOptionsMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Check, EllipsisVertical, LoaderCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import toastError from '@/errors/toastError';

const TicketActionButtons = ({ ticket, activeRating }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);

  const handleUpdateTicketStatus = async (status, userId) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: status,
        userId: userId || null,
      });

      setLoading(false);
      if (status === 'open') {
        navigate(`/tickets/${ticket.id}`);
      } else {
        navigate('/tickets');
      }
    } catch (err) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: toastError(err),
      });
    }
  };

  return (
    <div>
      {ticket.status === 'open' && (
        <>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={() => handleUpdateTicketStatus('pending', null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white   "
                >
                  <RotateCcw className="h-6 w-6" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                Retornar para pendentes
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                {/*//! Aqui resolve muita coisa */}
                <div
                  onClick={() =>
                    handleUpdateTicketStatus(
                      activeRating === 'disabled' ? 'closed' : 'waitingRating',
                      user?.id,
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Check className="h-6 w-6" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Encerrar atendimento</TooltipContent>
            </Tooltip>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white   ">
              <TicketOptionsMenu ticket={ticket} />
            </div>
          </div>
        </>
      )}
      {ticket.status === 'pending' && (
        <Button
          size="sm"
          disabled={loading}
          onClick={() => handleUpdateTicketStatus('open', user?.id)}
        >
          {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Iniciar atendimento
        </Button>
      )}
    </div>
  );
};

export default TicketActionButtons;
