import React, { useEffect, useState } from 'react';

import TicketsManager from '../../components/TicketsManager';
import chat from '../../assets/chat.svg';
import { Outlet } from 'react-router-dom';
import api from '@/services/api';
import toastError from '@/errors/toastError';
import { useToast } from '@/hooks/use-toast';
const Chat = () => {
  const { toast } = useToast();
  const [activeRating, setActiveRating] = useState();
  const [ActiveSign, setActiveSign] = useState('enabled');
  const [activeSendAudio, setActiveSendAudio] = useState('enabled');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');

        const activeRating = data.find((s) => s.key === 'activeRating');
        const activeSign = data.find((s) => s.key === 'activeSign');
        const activeSendAudio = data.find((s) => s.key === 'activeSendAudio');

        if (activeRating) {
          setActiveRating(activeRating.value);
        }

        if (activeSign) {
          setActiveSign(activeSign.value);
        }

        if (activeSendAudio) {
          setActiveSendAudio(activeSendAudio.value);
        }
      } catch (err) {
        toast({
          variant: 'destructive',
          title: toastError(err),
        });
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[420px_1fr]">
      <TicketsManager />

      <Outlet context={[activeRating, ActiveSign, activeSendAudio]} />
      {/*       ) : (
        <div className="hidden md:flex flex-col items-center justify-center h-full bg-muted">
          <img
            className="h-[300px]  md:h-[420px]"
            src={chat}
            alt="Descrição da imagem"
          />
          <span className=" text-foreground text-2xl text-center">
            Pronto para um atendimento incrível?
            <br />
            <strong>Escolha um para começar!</strong>
          </span>
        </div>
      )} */}
    </div>
  );
};

export default Chat;
