/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [symbol]
 *
 * @date: 2023/1/6 20:49:35
 * @author: 聂成阳(niechengyang@bytedance.com)
 */

const supportSymbol = typeof Symbol === 'function' && Symbol.for;

export const REACT_ELEMENT_TYPE = supportSymbol
	? Symbol.for('react.element')
	: 0xeac7;


export const REACT_FRAGMENT_TYPE = supportSymbol
	? Symbol.for('react.fragment') : 0xeacb;
