import React from "react";
import ReactECharts from "echarts-for-react";
const BarChart = ({ isLoading, chats }) => {
  const gruposPorNome = chats.reduce((acumulador, objeto) => {
    const nome = objeto?.user?.name ?? "default";
    if (!acumulador[nome]) {
      acumulador[nome] = [];
    }
    acumulador[nome].push(objeto);
    return acumulador;
  }, {});

  const barOptions = {
    grid: { top: 8, right: 8, bottom: 24, left: 36 },
    xAxis: {
      type: "category",
      data: Object.keys(gruposPorNome),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: Object.values(gruposPorNome).map((v) => v.length),
        type: "bar",
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return (
    <ReactECharts
      option={barOptions}
      style={{ width: "100%" }}
      showLoading={isLoading}
    />
  );
};

export default BarChart;
