/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [react 入口文件]
 *
 * @date: 2023/1/6 20:38:49
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { jsxDEV, jsx, isValidElement as isValidElementFn } from './src/jsx';
import currentDispatcher, {
	Dispatcher,
	resolveDispatcher,
	Dispatch
} from './src/currentDispatcher';
// useState
export function useState<S>(initialState: (() => S) | S): [S, Dispatch<S>] {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
}

// 内部数据共享
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
};

export const version = '0.0.0';
export const createElement = jsx;

export const isValidElement = isValidElementFn;
