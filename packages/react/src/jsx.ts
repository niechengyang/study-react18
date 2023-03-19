/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/1/6 20:43:22
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from 'shared/ReactSymbols';
import {
	Type,
	Key,
	Ref,
	Props,
	ReactElementType,
	ElementType
} from 'shared/ReactTypes';
import hasOwnProperty from 'shared/hasOwnProperty';
const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	const element = {
		// This tag allows us to uniquely identify this as a React Element
		$$typeof: REACT_ELEMENT_TYPE,

		// Built-in properties that belong on the element
		type,
		key,
		ref,
		props,

		// Record the component responsible for creating this element.
		_owner: 'sunshine'
	};
	return element;
};
export function isValidElement(object: ReactElementType) {
	{
		return (
			typeof object === 'object' &&
			object !== null &&
			object.$$typeof === REACT_ELEMENT_TYPE
		);
	}
}
export function jsx(type: ElementType, config: any, ...maybeChildren: any) {
	let key: Key = null;
	let ref: Ref = null;
	const props: Props = {};
	for (const propName in config) {
		const val = config[propName];
		if (propName === 'key' && val !== undefined) {
			key = '' + val;
			continue;
		}
		if (propName === 'ref' && val !== undefined) {
			ref = val;
			continue;
		}
		if (hasOwnProperty.call(config, propName)) {
			props[propName] = val;
		}
	}
	const childrenLength = maybeChildren.length;
	if (childrenLength) {
		if (childrenLength === 1) {
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}
	return ReactElement(type, key, ref, props);
}

export const jsxDEV = (type: ElementType, config: any, maybeKey: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	if (maybeKey) {
		key = '' + maybeKey;
	}
	for (const prop in config) {
		const val = config[prop];
		// if (prop === 'key') {
		// 	if (val !== undefined) {
		// 		key = '' + val;
		// 	}
		// 	continue;
		// }
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	return ReactElement(type, key, ref, props);
};

export const Fragment = REACT_FRAGMENT_TYPE;
