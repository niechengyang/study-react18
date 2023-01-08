/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/1/8 20:58:12
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { Container } from './hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTag';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

// 创建fiberRootNode 和hostFiberNode 并且绑定二者的关系
export function createContainer(container: Container) {
	const hostFiberNode = new FiberNode(HostRoot, {}, null);
	const fiberRootNode = new FiberRootNode(container, hostFiberNode);
	hostFiberNode.updateQueue = createUpdateQueue();
	return fiberRootNode;
}

// 触发更新的入口
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const update = createUpdate(element);
	const hostFiberNode = root.current;
	enqueueUpdate(
		hostFiberNode.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);
	scheduleUpdateOnFiber(hostFiberNode);
	return element;
}
