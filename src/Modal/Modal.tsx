import React, { CSSProperties, ReactNode, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.scss';
import classnames from 'classnames';

export interface ModalProps {
  className?: string;
  style?: CSSProperties;
  title?: string | ReactNode;
  width?: string | number;
  closable?: boolean;
  closeIcon?: ReactNode;
  destroyOnClose?: boolean;
  visible: boolean;
  footer?: ReactNode | null;
  mask?: boolean;
  maskOpacity?: number;
  zIndex?: number;
  left?: number | string;
  top?: number | string;
  centered?: boolean;
  onCancel?: () => any;
  onOk?: () => any;
  okText?: string;
  cancelText?: string;
  getContainer?: HTMLElement | boolean;
  draggable?: boolean;
  content?: string | ReactNode
}

interface ElementProps {
  width: number;
  height: number;
}

interface PositionProps {
  x: number;
  y: number;
}

const Modal: React.FC<ModalProps> = props => {
  const {
    className,
    style,
    title,
    width,
    closable,
    closeIcon,
    destroyOnClose,
    visible,
    footer,
    mask,
    maskOpacity,
    zIndex,
    left,
    top,
    centered,
    children,
    onOk,
    onCancel,
    okText,
    cancelText,
    getContainer,
    draggable,
    content
  } = props;
  const [viewport, setViewport] = useState<ElementProps>({
    width: document.body.clientWidth || document.documentElement.clientWidth,
    height: document.body.clientHeight || document.documentElement.clientHeight,
  });
  const modalRootNode = useRef<HTMLDivElement>(null);
  // rootElement 就是modal根节点
  const [rootElement, setRootElement] = useState<ElementProps>({
    width: 0,
    height: 0,
  });
  const modalRootNodePosition = useRef<PositionProps>({
    x: 0,
    y: 0,
  });
  const mouseDownPosition = useRef<PositionProps>({
    x: 0,
    y: 0,
  });
  useEffect(() => {
    // 注意点：translate 的中心点是是最初元素的位置
    const eleX = (modalRootNode.current as HTMLDivElement).getBoundingClientRect().x; // 元素相对于视口的位置的x
    const eleY = (modalRootNode.current as HTMLDivElement).getBoundingClientRect().y;  // 元素相对于视口的位置的y
    modalRootNodePosition.current.x = eleX;
    modalRootNodePosition.current.y = eleY;
  }, [visible, viewport]);

  useEffect(() => {
    if (visible) {
      setRootElement({
        width: (modalRootNode.current as HTMLDivElement).getBoundingClientRect().width,
        height: (modalRootNode.current as HTMLDivElement).getBoundingClientRect().height,
      });
      window.addEventListener('resize', resize, true);
    } else {
      // 关闭modal的时候,modal恢复初始位置
      (modalRootNode.current as HTMLDivElement).style.left = left ? typeof left === 'number' ? `${left}px` : left : `${viewport.width / 2 - rootElement.width / 2}px`;
      (modalRootNode.current as HTMLDivElement).style.top = centered ? `${viewport.height / 2 - rootElement.height / 2}px` : typeof top === 'string' ? top : `${top}px`;
      window.removeEventListener('resize', resize, true);
    }
    return () => {
      window.removeEventListener('resize', resize, true);
    };
  }, [visible]);

  const resize = () => {
    setViewport({
      width: document.body.clientWidth || document.documentElement.clientWidth,
      height: document.body.clientHeight || document.documentElement.clientHeight,
    });
  };

  /**
   *  modal 头按下事件
   * @param e
   */
  const onMouseDown = (e: React.MouseEvent) => {
    if (!draggable) { // 说明不想拖动
      return;
    }
    const eleX = (modalRootNode.current as HTMLDivElement).getBoundingClientRect().x; // 元素相对于视口的位置的x
    const eleY = (modalRootNode.current as HTMLDivElement).getBoundingClientRect().y;  // 元素相对于视口的位置的y
    modalRootNodePosition.current.x = eleX;
    modalRootNodePosition.current.y = eleY;
    mouseDownPosition.current.x = e.clientX;
    mouseDownPosition.current.y = e.clientY;
    // @ts-ignore
    window.addEventListener('mousemove', onMousemove);
    window.addEventListener('mouseup', onMouseUp);
    (modalRootNode.current as HTMLDivElement).style.cursor = 'move';
  };

  const onMousemove = (e: React.MouseEvent) => {
    const mouseMovePosition = {
      x: e.clientX,
      y: e.clientY,
    };
    let xPosition = mouseMovePosition.x - mouseDownPosition.current.x + modalRootNodePosition.current.x; // modal最终水平方向的位置
    let yPosition = mouseMovePosition.y - mouseDownPosition.current.y + modalRootNodePosition.current.y; // modal最终垂直方向的位置

    if (yPosition <= 0) { // 说明向上移动
      yPosition = 0;
    }

    if (yPosition >= viewport.height - 46) {
      yPosition = viewport.height - 46;
    }

    if (xPosition <= -rootElement.width / 2) {
      xPosition = -rootElement.width / 2;
    }

    if (xPosition >= viewport.width - rootElement.width / 2) {
      xPosition = viewport.width - rootElement.width / 2;
    }

    (modalRootNode.current as HTMLDivElement).style.left = `${xPosition}px`;
    (modalRootNode.current as HTMLDivElement).style.top = `${yPosition}px`;
  };

  const onMouseUp = () => {
    // @ts-ignore
    window.removeEventListener('mousemove', onMousemove);
    window.removeEventListener('mouseup', onMouseUp);
    (modalRootNode.current as HTMLDivElement).style.cursor = 'default';
  };

  /**
   * 关闭Modal
   */
  const closeModal = (e: React.MouseEvent) => {
    e.preventDefault();
    onCancel && onCancel();
    (modalRootNode.current as HTMLDivElement).style.left = left ? typeof left === 'number' ? `${left}px` : left : `${viewport.width / 2 - rootElement.width / 2}px`;
    (modalRootNode.current as HTMLDivElement).style.top = centered ? `${viewport.height / 2 - rootElement.height / 2}px` : typeof top === 'string' ? top : `${top}px`;
  };

  /**
   * 确定按钮的点击事件
   */
  const confirmBtnClick = () => {
    onOk && onOk();
  };

  const classes = classnames('hui-modal', className, {
    'hui-modal-hidden': !visible,
  });
  const modalStyle: CSSProperties = {
    ...style,
    width: width,
    zIndex: (zIndex as number) + 1,
    left: left ? left : viewport.width / 2 - rootElement.width / 2,
    top: centered ? viewport.height / 2 - rootElement.height / 2 : top,
  };

  return (
    getContainer === false ?
      <div className="hui-modal-root">
        {
          mask && visible ?
            <div
              className="hui-modal-mask"
              style={{
                zIndex: zIndex,
                opacity: maskOpacity,
              }}/>
            :
            null
        }
        <div ref={modalRootNode} className={classes} style={modalStyle}>
          <div className="hui-modal-header" onMouseDown={onMouseDown}>
            <div className="hui-modal-title">{title}</div>
            {
              closable ?
                <div className="hui-modal-close-icon" onClick={closeModal}>
                  {
                    closeIcon ?
                      closeIcon
                      :
                      <svg viewBox="0 0 1024 1024" version="1.1"
                           xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M589.312 523.776l407.04-407.04c20.48-20.48 20.48-54.272 0-74.752l-2.048-2.048c-20.48-20.48-54.272-20.48-74.752 0L512 446.976 104.96 39.936c-20.48-20.48-54.272-20.48-74.752 0l-2.048 2.048c-20.992 20.48-20.992 54.272 0 74.752L435.2 523.776 28.16 930.816c-20.48 20.48-20.48 54.272 0 74.752l2.048 2.048c20.48 20.48 54.272 20.48 74.752 0l407.04-407.04 407.04 407.04c20.48 20.48 54.272 20.48 74.752 0l2.048-2.048c20.48-20.48 20.48-54.272 0-74.752l-406.528-407.04z"
                        />
                      </svg>
                  }
                </div>
                :
                null
            }
          </div>
          <div className="hui-modal-content">
            {
              destroyOnClose ?
                visible ?
                  content ? content : children
                  :
                  null
                :
                content ? content : children
            }
          </div>
          {
            footer === null ?
              null
              :
              <div className="hui-modal-footer">
                {
                  footer ?
                    footer
                    :
                    <>
                      <button className="hui-btn" onClick={closeModal}>{cancelText}</button>
                      <button style={{ marginLeft: '8px' }} className="hui-btn hui-btn-primary"
                              onClick={confirmBtnClick}>{okText}
                      </button>
                    </>
                }
              </div>
          }
        </div>
      </div>
      :
      ReactDOM.createPortal(<div className="hui-modal-root">
        {
          mask && visible ?
            <div
              className="hui-modal-mask"
              style={{
                zIndex: zIndex,
                opacity: maskOpacity,
              }}/>
            :
            null
        }
        <div ref={modalRootNode} className={classes} style={modalStyle}>
          <div className="hui-modal-header" onMouseDown={onMouseDown}>
            <div className="hui-modal-title">{title}</div>
            {
              closable ?
                <div className="hui-modal-close-icon" onClick={closeModal}>
                  {
                    closeIcon ?
                      closeIcon
                      :
                      <svg viewBox="0 0 1024 1024" version="1.1"
                           xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M589.312 523.776l407.04-407.04c20.48-20.48 20.48-54.272 0-74.752l-2.048-2.048c-20.48-20.48-54.272-20.48-74.752 0L512 446.976 104.96 39.936c-20.48-20.48-54.272-20.48-74.752 0l-2.048 2.048c-20.992 20.48-20.992 54.272 0 74.752L435.2 523.776 28.16 930.816c-20.48 20.48-20.48 54.272 0 74.752l2.048 2.048c20.48 20.48 54.272 20.48 74.752 0l407.04-407.04 407.04 407.04c20.48 20.48 54.272 20.48 74.752 0l2.048-2.048c20.48-20.48 20.48-54.272 0-74.752l-406.528-407.04z"
                        />
                      </svg>
                  }
                </div>
                :
                null
            }
          </div>
          <div className="hui-modal-content">
            {
              destroyOnClose ?
                visible ?
                  content ? content : children
                  :
                  null
                :
                content ? content : children
            }
          </div>
          {
            footer === null ?
              null
              :
              <div className="hui-modal-footer">
                {
                  footer ?
                    footer
                    :
                    <>
                      <button className="hui-btn" onClick={closeModal}>{cancelText}</button>
                      <button style={{ marginLeft: '8px' }} className="hui-btn hui-btn-primary"
                              onClick={confirmBtnClick}>{okText}
                      </button>
                    </>
                }
              </div>
          }
        </div>
      </div>, (getContainer as HTMLElement))
  );
};

Modal.defaultProps = {
  title: '弹框标题',
  width: 520,
  closable: true, // 是否显示头部关闭按钮
  destroyOnClose: true, // 关闭弹框时销毁里面modal的子元素
  visible: false, // 控制弹框的显示与隐藏
  mask: true, // 是否显示遮罩层
  maskOpacity: 1, // 遮罩层的透明度
  zIndex: 1100,
  centered: true, // 是否垂直居中显示
  top: 200, // 距离视口顶部的距离，centered为true的时候，top失效
  okText: '确认',
  cancelText: '取消',
  getContainer: document.body, // 指定Modal挂载到哪个HTML节点上，默认是直接挂载到Body标签内部，值为false的时候挂载到当前节点上。
  draggable: true,
};

export default Modal;
