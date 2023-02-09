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

export function renderWithHooks(wip: FiberNode) {
	const component = wip.type;
	const props = wip.pendingProps;
	return component(props);
}
