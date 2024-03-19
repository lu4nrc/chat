/* import DateRangePicker from "@wojtekmaj/react-daterange-picker"; */
import { DateRangePicker as DTRange } from "react-date-range";
import { Calendar } from "react-feather";
import { pt } from "date-fns/locale";

import "./styles.css";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { useState } from "react";

const CustomDateRangePicker = () => {
  const [value, onChange] = useState([new Date(), new Date()]);

  return (
    <div className="app">
      {/*       <div className="date-picker-container">
        <DateRangePicker
          onChange={onChange}
          value={value}
          calendarIcon={<Calendar />}
          clearIcon={null}
          locale="pt-br"
          className="inputCalendar"
          calendarClassName="calendar"
        />
      </div> */}
      <div className="date-range-container">
        <DTRange
          className="calendar"
          locale={pt}
          staticRanges={[]}
          inputRanges={[]}
          showDateDisplay={true}
          showMonthArrow={false}
          weekStartsOn={0}
          months={1}
          scroll={{ enabled: true }}
          minDate={new Date("2021-08-01")}
          maxDate={new Date()}
          ranges={[
            {
              startDate: value[0],
              endDate: value[1],
              key: "selection",
              color: "#009688",
            },
          ]}
          onChange={(r) =>
            onChange([r.selection.startDate, r.selection.endDate])
          }
        />
      </div>
    </div>
  );
};

export default CustomDateRangePicker;
