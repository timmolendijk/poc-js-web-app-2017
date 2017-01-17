import * as styles from './index.css';
import { createElement, Component } from 'react';
import { Style } from 'react-style';

export default function Loading() {
  return <div className="Loading">
    <Style>{styles}</Style>
    <svg viewBox="25 25 50 50">
      <circle cx="50" cy="50" r="20" />
    </svg>;
  </div>;
}
