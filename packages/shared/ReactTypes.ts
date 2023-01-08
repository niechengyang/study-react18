/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [类型定义]
 *
 * @date: 2023/1/6 21:00:21
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
export type Type = any;
export type Key = any;
export type Ref = any;
export type Props = any;
export type ElementType = any;

export interface ReactElementType {
	$$typeof: symbol | number;
	key: Key;
	type: Type;
	ref: Ref;
	props: Props;
	_owner: string;
}
