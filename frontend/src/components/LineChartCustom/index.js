import React from "react";
import { Chart } from "react-charts";
const data = [
  {
    label: "Departamento pessoal",
    data: [
      {
        date: new Date(),
        stars: 202123,
      },
      {
        date: new Date(),
        stars: 202123,
      },
      {
        date: new Date(),
        stars: 202123,
      },
      {
        date: new Date(),
        stars: 202123,
      },

      // ...
    ],
  },
  {
    label: "Contábil",
    data: [
      {
        date: new Date(),
        stars: 10234230,
      },
      {
        date: new Date(),
        stars: 10234230,
      },
      {
        date: new Date(),
        stars: 10234230,
      },

      // ...
    ],
  },
];
export default function Line() {
  const primaryAxis = React.useMemo(
    () => ({
      getValue: (datum) => datum.date,
    }),
    []
  );

  const secondaryAxes = React.useMemo(
    () => [
      {
        getValue: (datum) => datum.stars,
      },
    ],
    []
  );
  return (
    <>
      <Chart
        options={{
          data,
          primaryAxis,
          secondaryAxes,
        }}
      />
    </>
  );
}
