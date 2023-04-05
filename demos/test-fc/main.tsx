/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/2/5 13:01:33
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [num, updateNum] = useState(0);
	useEffect(() => {
		console.log('App mount');
	}, []);

	useEffect(() => {
		console.log('num change create', num);
		return () => {
			console.log('num change destroy', num);
		};
	}, [num]);

	return (
		<div onClick={() => updateNum(num + 1)}>
			{num === 0 ? <Child /> : 'noop'}
		</div>)
}
function Child() {
	useEffect(() => {
		console.log('Child mount');
		return () => console.log('Child unmount');
	}, []);

	return 'i am child';
}

// function Child() {
// 	return <span>big-react</span>;
// }
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
