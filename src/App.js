import React, { Component } from 'react';
import { Button } from 'antd';
import { Layout, Menu, Breadcrumb } from 'antd';
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import './App.css';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

// To deal with a value that changes in a component
// we use state and setstate

class App extends Component {
  render() {
  return (
    <div className="App">
    <Button type="secondary">Button</Button>
  </div>
  );
  }
}

export default App;
