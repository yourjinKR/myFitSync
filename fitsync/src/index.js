import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {legacy_createStore as createStore} from 'redux';
import {Provider} from 'react-redux';
import rootReducer from './reducers/index';

const userInfo = createStore(rootReducer);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={userInfo} >
        <App />
    </Provider>
);

