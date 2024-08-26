import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { intervalToDuration } from "date-fns";
import React from "react";

const Media = ({ mediaData, loading }) => {
  console.log(mediaData)
  function convertMinToHour(min) {
    const duration = intervalToDuration({ start: 0, end: min * 60 * 1000 });

    const horas = duration.hours;
    const minutos = duration.minutes;

    return `${horas}h${minutos}m`;
  }

  if (loading) {
    return <div>Carregando dados...</div>; // Personalize o indicador de loading aqui
  }
  return (
    mediaData && (
      <Card className="h-full">
        <div className="pt-2 pl-2 flex gap-2">
          <CardTitle>Tempo Médio</CardTitle>
        </div>
        <CardContent className="flex flex-row  p-4">
          <div className="flex w-full items-center gap-2">
            <div className="grid flex-1 auto-rows-min gap-0.5">
              <div className="text-sm text-chart2">
                Aguardando
              </div>
              <div className="flex items-baseline gap-1 text-base font-bold tabular-nums leading-none">
              {convertMinToHour(mediaData ? mediaData.m_accept / mediaData.total : 0)}
              </div>
            </div>
            <Separator orientation="vertical" className="mx-2 h-10 w-px" />
            <div className="grid flex-1 auto-rows-min gap-0.5">
              <div className="text-sm text-chart1">Atendendo</div>
              <div className="flex items-baseline gap-1 text-base font-bold tabular-nums leading-none">
              {convertMinToHour(mediaData ? mediaData.m_atend / mediaData.total : 0)}
              </div>
            </div>
            <Separator orientation="vertical" className="mx-2 h-10 w-px" />
            <div className="grid flex-1 auto-rows-min gap-0.5">
              <div className="text-sm text-primary">Total</div>
              <div className="flex items-baseline gap-1 text-base font-bold tabular-nums leading-none">
              {convertMinToHour(mediaData ? mediaData.m_total / mediaData.total : 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  );
};

export default Media;
