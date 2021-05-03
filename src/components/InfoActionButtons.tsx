import React, { useState } from 'react';

export type MenuProps = {
  onFileOpen: () => void;
  onFileSave: () => void;
  onFileSaveAs: () => void;
};

const InfoActionButtons: React.FC<MenuProps> = (props) => {
  return (
    <div className="action-buttons">
      <div className="control is-grouped">
        <a className="button is-small" onClick={props.onFileSave}>
          <i className="fa fa-chevron-down"></i>
        </a>
        <a className="button is-small">
          <i className="fa fa-refresh"></i>
        </a>
      </div>
      {/* <div className="control is-grouped">
        <a className="button is-small">
          <i className="fa fa-inbox"></i>
        </a>
        <a className="button is-small">
          <i className="fa fa-exclamation-circle"></i>
        </a>
        <a className="button is-small">
          <i className="fa fa-trash-o"></i>
        </a>
      </div> */}
      <div className="control is-grouped" onClick={props.onFileOpen}>
        <a className="button is-small">
          <i className="fa fa-folder"></i>
        </a>
        <a className="button is-small">
          <i className="fa fa-tag"></i>
        </a>
      </div>
      <div className="control is-grouped pg">
        <div className="title">1-10 of 100</div>
        <a className="button is-link">
          <i className="fa fa-chevron-left"></i>
        </a>
        <a className="button is-link">
          <i className="fa fa-chevron-right"></i>
        </a>
      </div>
    </div>
  );
};

export default InfoActionButtons;
