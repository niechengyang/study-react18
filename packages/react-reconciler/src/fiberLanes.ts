/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/3/19 15:21:02
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { FiberRootNode } from './fiber';

export type Lane = number;
export type Lanes = number;

export const SyncLane = 0x0001;
export const NoLane = 0b0000;
export const NoLanes = 0b0000;

export function mergeLane(laneA: Lane, laneB: Lane) {
	return laneA | laneB;
}

export function requestUpdateLane() {
	return SyncLane;
}

export function getHighestPriorityLane(lanes: Lanes): Lane {
	return lanes & -lanes;
}

export function markRootFinished(root: FiberRootNode, lane: Lane) {
	root.pendingLanes &= ~lane;
}
