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
	const [num, setNum] = useState(0);
	return (
		<div onClick={() => {
			console.log('div点击')
		}}>
			<span onClick={(e) => {
				e.stopPropagation();
				setNum(num + 1)
				console.log('span点击')
			}}>{num}</span>
		</div>
	);
}

// function Child() {
// 	return <span>big-react</span>;
// }
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
