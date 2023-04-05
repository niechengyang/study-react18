/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/2/9 20:05:58
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { Action } from 'shared/ReactTypes';

export type Dispatch<S> = (action: Action<S>) => void;

export interface Dispatcher {
	useState<S>(initialState: (() => S) | S): [S, Dispatch<S>];
	useEffect(create: () => (() => void) | void, deps: any[] | null): void;
}

/**
 * Keeps track of the current dispatcher.
 */
const currentDispatcher: {
	current: null | Dispatcher;
} = {
	current: null
};

export function resolveDispatcher() {
	const dispatcher = currentDispatcher.current;
	if (dispatcher === null) {
		console.error(
			'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' +
				' one of the following reasons:\n' +
				'1. You might have mismatching versions of React and the renderer (such as React DOM)\n' +
				'2. You might be breaking the Rules of Hooks\n' +
				'3. You might have more than one copy of React in the same app\n' +
				'See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.'
		);
		throw new Error('hook只能在函数组件中执行');
	}
	return dispatcher;
}
export default currentDispatcher;
