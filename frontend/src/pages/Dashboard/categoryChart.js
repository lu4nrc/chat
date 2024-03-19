import React from "react";
import ReactECharts from "echarts-for-react";
const CategoryChart = ({ isLoading, chats }) => {
  const gruposPorNome = chats.reduce((acumulador, objeto) => {
    const nome = objeto?.queue?.name ?? "default";
    if (!acumulador[nome]) {
      acumulador[nome] = [];
    }
    acumulador[nome].push(objeto);
    return acumulador;
  }, {});
  const options = {
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
        type: "line",
        smooth: true,
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };

  return (
    <ReactECharts
      option={options}
      style={{ width: "100%" }}
      showLoading={isLoading}
    />
  );
};

export default CategoryChart;
