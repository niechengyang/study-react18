/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/1/8 15:59:48
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { FiberNode } from './fiber';
import {
	Fragment,
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTag';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFiber';
import { renderWithHooks } from './fiberHooks';
import { Lane } from './fiberLanes';

export const beginWork = (wip: FiberNode, renderLane: Lane) => {
	// <A><B/></A>
	// 当进入A的beginWork时，通过对比B current fiberNode与B reactElement，生成B对应wip fiberNode。
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip, renderLane);
		case HostComponent:
			return updateHostComponent(wip);
		case FunctionComponent:
			return updateFunctionComponent(wip, renderLane);
		case Fragment:
			return updateFragmentComponent(wip);
		case HostText:
			return null;
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
			break;
	}
	return null;
	// 递归中的递阶段，返回子fiberNode
};
function updateFragmentComponent(wip: FiberNode) {
	const nextChildren = wip.pendingProps;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}
function updateFunctionComponent(wip: FiberNode, renderLane: Lane) {
	const nextChildren = renderWithHooks(wip, renderLane);
	reconcileChildren(wip, nextChildren);
	return wip.child;
}
function updateHostRoot(wip: FiberNode, renderLane: Lane) {
	// 计算出最新的更新状态，生成子fiberNode
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending, renderLane);
	wip.memoizedState = memoizedState;
	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const newProps = wip.pendingProps;
	const nextChildren = newProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate;
	if (current !== null) {
		// 更新的逻辑
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount逻辑
		wip.child = mountChildFibers(wip, null, children);
	}
}
