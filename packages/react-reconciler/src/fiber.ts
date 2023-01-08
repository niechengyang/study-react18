/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/1/8 15:44:10
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { Key, Props, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTag';
import { Flags, NoFlags } from './fiberFlags';
// @ts-ignore
import { Container } from 'hostConfig';
export class FiberNode {
	tag: WorkTag;
	key: Key;
	type: any;
	stateNode: any;


	return: FiberNode | null;
	child: FiberNode | null;
	sibling: FiberNode | null;
	index: number;
	ref: Ref;

	pendingProps: Props;
	memoizedProps: Props | null;
	memoizedState: any;
	alternate: FiberNode | null;
	updateQueue: unknown;

	flags: Flags;
	constructor (tag: WorkTag, pendingProps: Props, key: Key) {
		// 作为实例
		this.tag = tag;
		this.key = key;
		this.type = null;
		// 保存当前节点的dom元素
		this.stateNode = null;


		// 作为Fiber树形结构
		this.return = null;
		this.child = null;
		this.sibling = null;
		this.index = 0;
		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.alternate = null;
		this.updateQueue = null;
		// 副作用
		this.flags = NoFlags;
	}

}

// 定义rootFiberNode
export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishWork: FiberNode | null;
	constructor (container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		this.finishWork = null;
		hostRootFiber.stateNode = this
	}
}

export function createWorkInProgress(current: FiberNode, pendingProps: Props): FiberNode {
	let wip = current.alternate;
	if (wip === null) {
		wip = new FiberNode(
			current.tag,
			pendingProps,
			current.key
		);
		wip.stateNode = current.stateNode;
		wip.alternate = current;
	} else {
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;
	return wip;
}
