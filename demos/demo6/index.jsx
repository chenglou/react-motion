import React from 'react';
import 'react-hot-api/dist/ReactHotAPI.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/neat.css';
import './editor.css';
import './demo.css';
import Demo from './Demo';

React.render(<Demo />, document.querySelector('#content'));
