import React, { useState } from 'react';

type SideBarProps = {
  onNew: () => void;
};

const SideBar: React.FC<SideBarProps> = (props) => {
  return (
    <aside className="aside is-hidden-mobile">
      <div>
        <div className="compose has-text-centered">
          <a
            className="button is-danger is-block is-bold"
            onClick={props.onNew}
          >
            <span className="compose">New</span>
          </a>
        </div>
        <div className="main">
          <a href="#" className="item">
            <span className="icon">
              <i className="fa fa-inbox"></i>
            </span>
            <span className="name">Inbox</span>
            <ul className="menu-list">
              <li>
                <span>Customers</span>
              </li>
              <li>
                <span>Other</span>
              </li>
            </ul>
          </a>
          <a href="#" className="item">
            <span className="icon">
              <i className="fa fa-star"></i>
            </span>
            <span className="name">Starred</span>
          </a>
          <a href="#" className="item">
            <span className="icon">
              <i className="fa fa-envelope-o"></i>
            </span>
            <span className="name">Sent Mail</span>
          </a>

          <a href="#" className="item">
            <span className="icon">
              <i className="fa fa-folder-o"></i>
            </span>
            <span className="name">Folders</span>
            <ul className="menu-list">
              <li>
                <span>Team Settings</span>
              </li>
              <li>
                <span>Manage Your Team</span>
                <ul>
                  <li>
                    <span>Members</span>
                  </li>
                  <li>
                    <span>Plugins</span>
                  </li>
                  <li>
                    <span>Add a member</span>
                  </li>
                  <li>
                    <span>Remove a member</span>
                  </li>
                </ul>
              </li>
              <li>
                <span>Invitations</span>
              </li>
              <li>
                <span>Cloud Storage Environment Settings</span>
              </li>
              <li>
                <span>Authentication</span>
              </li>
              <li>
                <span>Payments</span>
              </li>
            </ul>{' '}
          </a>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
