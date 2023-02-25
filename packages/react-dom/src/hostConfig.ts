/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/1/29 19:54:39
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { FiberNode } from 'react-reconciler/src/fiber';
import { HostText } from 'react-reconciler/src/workTag';
import { Props } from 'shared/ReactTypes';
import { DOMElement, updateFiberProps } from './syntheticEvent';

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

// export const createInstance = (type: string, props: any): Instance => {
export const createInstance = (type: string, props: Props): Instance => {
	const element = document.createElement(type, props) as Element;
	updateFiberProps(element as DOMElement, props);
	return element;
};

export const appendInitialChild = (
	parent: Instance | Container,
	child: Instance
) => {
	parent.appendChild(child);
};

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export function commitUpdate(fiber: FiberNode) {
	switch (fiber.tag) {
		case HostText:
			const text = fiber.memoizedProps.content;
			return commitTextUpdate(fiber.stateNode, text);
		default:
			if (__DEV__) {
				console.warn('未实现其他类型的update', fiber);
			}
			break;
	}
}
export function commitTextUpdate(textInstance: TextInstance, content: string) {
	textInstance.textContent = content;
}

export function removeChild(child: TextInstance | Instance, parent: Container) {
	parent.removeChild(child);
}

export const appendChildToContainer = appendInitialChild;
