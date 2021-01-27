import React, { useState } from 'react';
import Modal from './Modal/Modal';

function App() {
  const [modalProps, setModalProps] = useState({
    visible: true,
  });



  return (
    <div className="App">
      <Modal
        title="自定义弹框111"
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
        content="主题哈哈哈"
      />
    </div>
  );
}

export default App;
