import React, { useState } from "react";
// import axios from "axios";

import { Table, Modal, Radio } from "antd";
import "antd/dist/antd.css";
import { HistoryOutlined } from "@ant-design/icons";

const RealTimeInfo = (realTimeData) => {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState({});
  const [alertTime, setAlertTime] = useState(1);
  const stopid = realTimeData.realTimeData.stopid;
  realTimeData = realTimeData.realTimeData.data;

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
    {
      title: "Set Alert",
      key: "duetimeButton",
      render: (text, record) => (
        <HistoryOutlined
          onClick={() => showModal(record.route, record.duetime)}
        />
      ),
    },
  ];
  const showModal = (route, duetime) => {
    setState({
      route,
      duetime,
    });
    setVisible(true);
  };

  const handleOk = (e) => {
    console.log(e);
    setVisible(false);
    console.log(state.duetime - alertTime);
    setTimeout(setAlert, (state.duetime - alertTime) * 60000);
  };

  const handleCancel = (e) => {
    console.log(e);
    setVisible(false);
  };

  const onRadioChange = (e) => {
    setAlertTime(e.target.value);
  };

  function setAlert() {
    alert(
      `The ${state.route} is due in ${alertTime} ${
        alertTime < 2 ? "minute" : "minutes"
      }`
    );
  }

  return (
    <div className="realTime">
      <h2>{`Stop ${stopid}`}</h2>
      <Table
        dataSource={realTimeData}
        columns={columns}
        pagination={false}
        rowKey={(record) => record.arrivaldatetime + record.route}
      />
      ;
      <Modal
        title="Basic Modal"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        I want to be notified when the {state.route} is due in
        <Radio.Group
          onChange={onRadioChange}
          defaultValue="1"
          buttonStyle="solid"
        >
          <Radio.Button
            value="1"
            disabled={state.duetime === "Due" ? true : false}
          >
            1 mins
          </Radio.Button>
          <Radio.Button
            value="5"
            disabled={
              state.duetime <= 5 || state.duetime === "Due" ? true : false
            }
          >
            5 mins
          </Radio.Button>
          <Radio.Button
            value="10"
            disabled={
              state.duetime <= 10 || state.duetime === "Due" ? true : false
            }
          >
            10 mins
          </Radio.Button>
        </Radio.Group>
      </Modal>
    </div>
  );
};

export default RealTimeInfo;
