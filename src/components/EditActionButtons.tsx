import React, { useState } from 'react';

type MenuProps = {
  onLoadData: () => void;
  onSaveData: () => void;
  onAllClear: () => void;
};

const EditActionButtons: React.FC<MenuProps> = (props) => {
  return (
    <div className="action-buttons">
      <div className="control is-grouped">
        <a className="button is-small" onClick={props.onLoadData}>
          <i className="fa fa-inbox"></i>
        </a>
        <a className="button is-small" onClick={props.onSaveData}>
          <i className="fa fa-chevron-down"></i>
        </a>
        <a className="button is-small" onClick={props.onAllClear}>
          <i className="fa fa-trash-o"></i>
        </a>
      </div>
      {/* <div className="control is-grouped">
        <a className="button is-small">
          <i className="fa fa-exclamation-circle"></i>
        </a>
        <a className="button is-small">
          <i className="fa fa-trash-o"></i>
        </a>
      </div> */}
      <div className="control is-grouped">
        <a className="button is-small">
          <i className="fa fa-folder"></i>
        </a>
        <a className="button is-small">
          <i className="fa fa-tag"></i>
        </a>
      </div>
    </div>
  );
};

export default EditActionButtons;
