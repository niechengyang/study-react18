/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/1/8 16:03:18
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { HostRoot } from './workTag';
import { MutationMask, NoFlags } from './fiberFlags';
import { commitMutationEffects } from './commitWork';
// 当前工作的fiber节点
let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}
// 渲染入口，找出要更新的节点，提供到commit阶段
function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareFreshStack(root);
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
			workInProgress = null;
		}
	} while (true);
	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;
	commitRoot(root);
}
function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(unitOfWork: FiberNode) {
	const next = beginWork(unitOfWork);
	unitOfWork.memoizedProps = unitOfWork.pendingProps;
	if (next === null) {
		// If this doesn't spawn new work, complete the current work.
		completeUnitOfWork(unitOfWork);
	} else {
		workInProgress = next;
	}
}

function completeUnitOfWork(unitOfWork: FiberNode) {
	let completedWork: FiberNode | null = unitOfWork;
	do {
		completeWork(completedWork);
		const sibling = completedWork.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		completedWork = completedWork.return;
		workInProgress = completedWork;
	} while (completedWork !== null);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}
	if (finishedWork === null) {
		return;
	}
	// 重置finishedWork
	root.finishedWork = null;
	// 判断是否需要有对应的更新标志 root flags / root subtreeFlags
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation

		// mutation
		commitMutationEffects(finishedWork);
		root.current = finishedWork;
		// layout
	}
}
