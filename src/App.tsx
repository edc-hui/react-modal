import React, { useState } from 'react';
import Modal from './Modal/Modal';

function App() {
  const [modalProps, setModalProps] = useState({
    visible: true,
  });
  return (
    <div className="App">
      <button onClick={()=>{
        setModalProps(state => ({
          ...state,
          visible: true,
        }));
      }}>打开弹框</button>
      <Modal
        title="自定义弹框"
        visible={modalProps.visible}
        onCancel={() => {
          setModalProps(state => ({
            ...state,
            visible: false,
          }));
        }}
        onOk={() => {
          setModalProps(state => ({
            ...state,
            visible: false,
          }));
        }}
        destroyOnClose={false}
        centered={false}
      >
        主题内容
      </Modal>
    </div>
  );
}

export default App;
