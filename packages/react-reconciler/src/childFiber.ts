/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/1/15 14:53:21
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import {
	createFiberFromElement,
	createWorkInProgress,
	FiberNode
} from './fiber';
import { Props, ReactElementType } from 'shared/ReactTypes';
import { ChildDeletion, Placement } from './fiberFlags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './workTag';

function useFiber(fiber: FiberNode, props: Props) {
	const clone = createWorkInProgress(fiber, props);
	clone.index = 0;
	clone.sibling = null;
	return clone;
}
function createChildReconciler(shouldTrackSideEffects: boolean) {
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackSideEffects) {
			return;
		}
		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= ChildDeletion;
		} else {
			deletions.push(childToDelete);
		}
	}
	function deleteRemainingChildren(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null
	) {
		if (!shouldTrackSideEffects) return;
		let childToDelete = currentFirstChild;
		while (childToDelete !== null) {
			deleteChild(returnFiber, childToDelete);
			childToDelete = childToDelete.sibling;
		}
	}
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		// 更新的逻辑，看看能不能复用之前的fiberNode, 条件：key相同且type相同
		const key = element.key;
		while (currentFiber !== null) {
			// 更新逻辑
			if (currentFiber.key === key) {
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (element.type === currentFiber.type) {
						// 复用逻辑 key相同, type相同
						const exist = useFiber(currentFiber, element.props);
						exist.return = returnFiber;
						// 删除其他没法复用的节点
						deleteRemainingChildren(returnFiber, currentFiber.sibling);
						return exist;
					}
					// key相同，type不同 == 不存在任何复用的可能性, 删除所有的子节点
					deleteRemainingChildren(returnFiber, currentFiber);
					break;
				} else {
					if (__DEV__) {
						console.warn('还未实现的react类型', element);
						break;
					}
				}
			} else {
				// key不同，type相同 或者 key 不同， type相同，
				// 当前节点无法复用，后续节点可能可以复用， 继续遍历
				deleteChild(returnFiber, currentFiber);
				currentFiber = currentFiber.sibling;
			}
		}
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}
	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		while (currentFiber !== null) {
			if (currentFiber.tag === HostText) {
				deleteRemainingChildren(returnFiber, currentFiber.sibling);
				const exist = useFiber(currentFiber, { content });
				exist.return = returnFiber;
				return exist;
			}
			deleteChild(returnFiber, currentFiber);
			currentFiber = currentFiber.sibling;
		}
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}
	function placeSingleChild(newFiber: FiberNode) {
		if (shouldTrackSideEffects && newFiber.alternate === null) {
			newFiber.flags |= Placement;
		}
		return newFiber;
	}
	function updateFromMap(
		existingChildren: Map<string | number, FiberNode>,
		returnFiber: FiberNode,
		newIdx: number,
		newChild: any
	): FiberNode | null {
		const keyToUse = newChild.key !== null ? newChild.key : newIdx;
		const before = existingChildren.get(keyToUse);
		// hostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			if (before) {
				if (before.tag === HostText) {
					existingChildren.delete(keyToUse);
					return useFiber(before, { content: newChild + '' });
				}
			}
			return new FiberNode(HostText, { content: newChild + '' }, null);
		}
		// react element
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					if (before) {
						if (before.type === newChild.type) {
							// 可复用
							existingChildren.delete(keyToUse);
							return useFiber(before, newChild.props);
						}
					}
					return createFiberFromElement(newChild);
			}
			// TODO 数组类型
			if (Array.isArray(newChild) && __DEV__) {
				console.warn('还未实现数组类型的child');
			}
		}
		return null;
	}
	function reconcileChildrenArray(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		newChild: any[]
	) {
		// 最后一个可复用的fiber在current中的index
		let lastPlacedIndex = 0;
		// 最后一个创建的fiber
		let lastNewFiber: FiberNode | null = null;
		// 第一个创建的fiber， 也是要返回的fiber
		let firstNewFiber: FiberNode | null = null;
		// 1、将current保存在map中
		const existingChildren = new Map<string | number, FiberNode>();
		let current = currentFirstChild;
		while (current !== null) {
			const keyToUse = current.key !== null ? current.key : current.index;
			existingChildren.set(keyToUse, current);
			current = current.sibling;
		}
		for (let i = 0; i < newChild.length; i++) {
			// 2.遍历newChild，寻找是否可复用
			const newFiber = updateFromMap(
				existingChildren,
				returnFiber,
				i,
				newChild[i]
			);
			if (newFiber === null) continue;
			// 3.标记移动还是插入
			newFiber.index = i;
			newFiber.return = returnFiber;
			if (lastNewFiber === null) {
				lastNewFiber = newFiber;
				firstNewFiber = newFiber;
			} else {
				lastNewFiber.sibling = newFiber;
				lastNewFiber = lastNewFiber.sibling;
			}
			if (!shouldTrackSideEffects) continue;
			const current = newFiber.alternate;
			if (current !== null) {
				const oldIndex = current.index;
				if (oldIndex < lastPlacedIndex) {
					// 移动
					newFiber.flags |= Placement;
				} else {
					// 不移动
					lastPlacedIndex = oldIndex;
				}
			} else {
				// mount
				newFiber.flags |= Placement;
			}
		}
		// 4、将剩下的节点标记为删除
		existingChildren.forEach((childToDelete) => {
			deleteChild(returnFiber, childToDelete);
		});
		return firstNewFiber;
	}
	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: any
	) {
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild);
					}
					break;
			}
			// 多节点diff
			if (Array.isArray(newChild)) {
				return reconcileChildrenArray(returnFiber, currentFiber, newChild);
			}
		}
		// HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}
		if (currentFiber !== null) {
			// 兜底删除
			deleteChild(returnFiber, currentFiber);
		}
		if (__DEV__) {
			console.warn('未实现的reconcile类型', newChild);
		}
		return null;
	};
}

export const reconcileChildFibers = createChildReconciler(true);
export const mountChildFibers = createChildReconciler(false);
