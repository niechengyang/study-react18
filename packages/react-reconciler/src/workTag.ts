/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/1/8 15:46:44
 * @author: 聂成阳(niechengyang@bytedance.com)
 */

export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText
	| typeof Fragment;

export const FunctionComponent = 0;
export const HostRoot = 3;

export const HostComponent = 5;
// <div>123</div>
export const HostText = 6;

// <></>
export const Fragment = 7;
