/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/2/5 12:44:34
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { FiberNode } from './fiber';
import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import internals from 'shared/internals';
import { createUpdate, createUpdateQueue, enqueueUpdate, UpdateQueue } from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

const  { currentDispatcher } = internals;
export type Hook = {
	memoizedState: any,
	updateQueue: any,
	next: Hook | null,
};
let workInProgressHook: Hook | null = null;
let currentlyRenderingFiber: FiberNode | null = null;

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState,
};

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	// 拿到hook对应的数据
	const hook = mountWorkInProgressHook();
	if (initialState instanceof Function) {
		initialState = initialState();
	}
	hook.memoizedState = initialState;
	const updateQueue = createUpdateQueue<State>();
	hook.updateQueue = updateQueue;
	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, updateQueue);
	updateQueue.dispatch = dispatch;
	return [initialState, dispatch];
}

function dispatchSetState<State>(fiber: FiberNode, updateQueue: UpdateQueue<State>, action: Action<State>) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null,
	};
	if (workInProgressHook === null) {
		// This is the first hook in the list
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		}
		currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
	} else {
		// Append to the end of the list
		workInProgressHook = workInProgressHook.next = hook;
	}
	return workInProgressHook;
}
export function renderWithHooks(wip: FiberNode) {
	// 赋值
	currentlyRenderingFiber = wip
	// 重置
	wip.memoizedState = null;
	const current = wip.alternate;
	if (current !== null) {
		// update
	} else {
		// 挂载 mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}
	const component = wip.type;
	const props = wip.pendingProps;
	const children =  component(props);

	// 重置操作
	currentlyRenderingFiber = null;
	return children;
}