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
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [num, setNum] = useState(100);

	// return <div onClickCapture={() => setNum(num + 1)}>{num}</div>;
	// const arr =
	// 	num % 2 === 0
	// 		? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
	// 		: [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];
	// const A = [<li>c</li>, <li>d</li>]
	// return <ul>
	// 	<li>a</li>
	// 	<li>b</li>
	// 	{A}
	// </ul>;
	return <ul onClick={() => {
		setNum(num => num + 1);
		setNum(num => num + 1);
		setNum(num => num + 1);
	}}>{num}</ul>;
}

// function Child() {
// 	return <span>big-react</span>;
// }
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
