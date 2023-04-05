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
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue,
	UpdateQueue
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';
import { Lane, NoLane, requestUpdateLane } from './fiberLanes';
import { HookEffectFlags, HookHasEffect, Passive } from './hookEffectTags';
import { PassiveEffect } from './fiberFlags';

const { currentDispatcher } = internals;
export type Hook = {
	memoizedState: any;
	updateQueue: any;
	next: Hook | null;
};
let workInProgressHook: Hook | null = null;
let currentlyRenderingFiber: FiberNode | null = null;
let currentHook: Hook | null = null;
let renderLane: Lane = NoLane;
type EffectCallback = () => void;
type EffectDeps = any[] | null;
export interface Effect {
	tag: HookEffectFlags;
	create: () => EffectCallback | void;
	destroy: EffectCallback | void;
	deps: EffectDeps;
	next: Effect | null;
}

export interface FCUpdateQueue<State> extends UpdateQueue<State> {
	lastEffect: Effect | null;
}
const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState,
	useEffect: mountEffect
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState,
	useEffect: updateEffect
};
function createFCUpdateQueue<State>() {
	const updateQueue = createUpdateQueue<State>() as FCUpdateQueue<State>;
	updateQueue.lastEffect = null;
	return updateQueue;
}
function pushEffect(
	flag: HookEffectFlags,
	create: () => EffectCallback | void,
	destroy: EffectCallback | void,
	deps: EffectDeps
): Effect {
	const effect: Effect = {
		tag: flag,
		create,
		destroy,
		deps,
		next: null
	};
	const fiber = currentlyRenderingFiber as FiberNode;
	const updateQueue = fiber.updateQueue as FCUpdateQueue<any>;
	if (updateQueue === null) {
		const updateQueue = createFCUpdateQueue();
		fiber.updateQueue = updateQueue;
		updateQueue.lastEffect = effect.next = effect;
	} else {
		const lastEffect = updateQueue.lastEffect;
		if (lastEffect === null) {
			updateQueue.lastEffect = effect.next = effect;
		} else {
			const firstEffect = lastEffect.next;
			lastEffect.next = effect;
			effect.next = firstEffect;
			updateQueue.lastEffect = effect;
		}
	}
	return effect;
}
function areHookInputsEqual(prevDeps: EffectDeps, nextDeps: any[]) {
	if (prevDeps === null) return false;
	for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
		// $FlowFixMe[incompatible-use] found when upgrading Flow
		if (Object.is(nextDeps[i], prevDeps[i])) {
			continue;
		}
		return false;
	}
	return true;
}
function mountEffect(create: () => EffectCallback | void, deps: EffectDeps) {
	// 拿到hook对应的数据
	const hook = mountWorkInProgressHook();
	const nextDeps = deps === undefined ? null : deps;
	// mount阶段需要执行create回调
	(currentlyRenderingFiber as FiberNode).flags |= PassiveEffect;
	hook.memoizedState = pushEffect(
		Passive | HookHasEffect,
		create,
		undefined,
		deps
	);
}
function updateEffect(create: () => EffectCallback | void, deps: EffectDeps) {
	const hook = updateWorkInProgressHook();
	const nextDeps = deps === undefined ? null : deps;
	let destroy: EffectCallback | void;
	if (currentHook !== null) {
		const prevEffect = currentHook.memoizedState as Effect;
		destroy = prevEffect.destroy;
		if (nextDeps !== null) {
			// 浅比较依赖，如果一样就不标记HookHasEffect flag
			if (areHookInputsEqual(prevEffect.deps, nextDeps)) {
				hook.memoizedState = pushEffect(Passive, create, destroy, nextDeps);
				return;
			}
		}
		// 浅比较 不相等 当前fiber 标志更新flag 且当前Effect 标记更新flag
		(currentlyRenderingFiber as FiberNode).flags |= PassiveEffect;
		hook.memoizedState = pushEffect(
			Passive | HookHasEffect,
			create,
			destroy,
			nextDeps
		);
	}
}
function updateState<State>(): [State, Dispatch<State>] {
	// 拿到hook对应的数据
	const hook = updateWorkInProgressHook();
	// 计算新的state的逻辑
	const queue = hook.updateQueue as UpdateQueue<State>;
	const pending = queue.shared.pending;
	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(
			hook.memoizedState,
			pending,
			renderLane
		);
		hook.memoizedState = memoizedState;
	}
	queue.shared.pending = null;
	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

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
	const dispatch = dispatchSetState.bind(
		null,
		currentlyRenderingFiber,
		updateQueue
	);
	updateQueue.dispatch = dispatch;
	return [initialState, dispatch];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const lane = requestUpdateLane();
	const update = createUpdate(action, lane);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber, lane);
}
function updateWorkInProgressHook(): Hook {
	// TODO render阶段触发的更新
	let nextCurrentHook: Hook | null;
	if (currentHook === null) {
		// 这是这个FC update时的第一个hook
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			// mount
			nextCurrentHook = null;
		}
	} else {
		nextCurrentHook = currentHook.next;
	}
	if (nextCurrentHook === null) {
		// mount/update u1 u2 u3
		// update       u1 u2 u3 u4
		throw new Error(
			`组件${currentlyRenderingFiber?.type}本次执行时的Hook比上次执行时多`
		);
	}
	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	};
	if (workInProgressHook === null) {
		// mount时 第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount时 后续的hook
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}
	return workInProgressHook;
}
function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
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
export function renderWithHooks(wip: FiberNode, lane: Lane) {
	// 赋值
	currentlyRenderingFiber = wip;
	renderLane = lane;
	// 重置
	wip.memoizedState = null;
	wip.updateQueue = null;
	const current = wip.alternate;
	if (current !== null) {
		// update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		// 挂载 mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}
	const component = wip.type;
	const props = wip.pendingProps;
	const children = component(props);

	// 重置操作
	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;
	renderLane = NoLane;
	return children;
}
