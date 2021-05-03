import React, { useState } from 'react';
import { MenuProps } from './InfoActionButtons';

const PreviewActionButtons: React.FC<MenuProps> = (props) => {
  return (
    <div className="action-buttons">
      <div className="control is-grouped">
        <a className="button is-small" onClick={props.onFileOpen}>
          <i className="fa fa-inbox"></i>
        </a>
        <a className="button is-small" onClick={props.onFileSave}>
          <i className="fa fa-chevron-down"></i>
        </a>
        <a className="button is-small">
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

export default PreviewActionButtons;
