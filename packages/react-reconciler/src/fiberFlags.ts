/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/1/8 15:55:52
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
export type Flags = number;

export const NoFlags = 0b0000001;
export const Placement = 0b0000010;
export const Update = 0b0000100;
export const ChildDeletion = 0b0001000;
