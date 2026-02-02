import React, { useState } from "react";
import { Radio, Card, Space, type RadioChangeEvent } from "antd";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { statisticsActions } from "../../../redux/statistics/statisticsSlice";
import { Dayjs } from "dayjs";
import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

const StatisticFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.statistics);
  const [filterType, setFilterType] = useState<string>("MONTH");

  const handleRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
    _dateStrings: [string, string],
  ) => {
    if (dates && dates[0] && dates[1]) {
      const start = dates[0].format("YYYY-MM-DD");
      const end = dates[1].format("YYYY-MM-DD");
      console.log("Khoảng thời gian tùy chỉnh:", start, end);
    }
  };
  const handleRadioChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    setFilterType(value);

    if (value !== "CUSTOM") {
      dispatch(statisticsActions.fetchData(value));
    }
  };

  return (
    <Card className="mb-6 shadow-sm border-none">
      <Space size="middle" wrap>
        <Radio.Group
          defaultValue="MONTH"
          buttonStyle="solid"
          onChange={handleRadioChange}
          disabled={loading}
          className="custom-radio-red"
        >
          <Radio.Button value="TODAY">Ngày</Radio.Button>
          <Radio.Button value="WEEK">Tuần</Radio.Button>
          <Radio.Button value="MONTH">Tháng</Radio.Button>
          <Radio.Button value="YEAR">Năm</Radio.Button>
          <Radio.Button value="CUSTOM">Tùy chỉnh</Radio.Button>
        </Radio.Group>

        {filterType === "CUSTOM" && (
          <RangePicker
            onChange={handleRangeChange}
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            style={{ borderRadius: "4px", borderColor: "#cf1322" }}
            autoFocus
          />
        )}
      </Space>
    </Card>
  );
};

export default StatisticFilter;
