import React, { useState } from "react";
// import axios from "axios";

import { Table, Tag, Space } from "antd";

const columns = [
  {
    title: "Route",
    dataIndex: "route",
    key: "route",
  },
  {
    title: "Destination",
    dataIndex: "destination",
    key: "destination",
  },
  {
    title: "Due",
    dataIndex: "duetime",
    key: "duetime",
  },
];

const RealTimeInfo = (realTimeData) => {
  const stopid = realTimeData.realTimeData.stopid;
  realTimeData = realTimeData.realTimeData.data;

  console.log(stopid);
  return (
    <div className="realTime">
      <Table
        dataSource={realTimeData}
        columns={columns}
        pagination={false}
        rowKey={(record) => record.arrivaldatetime + record.route}
        title={() => `Stop ${stopid}`}
      />
      ;
    </div>
  );
};

export default RealTimeInfo;
