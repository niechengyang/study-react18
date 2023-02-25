/**
 * Copyright (c) 2021 ByteDance Inc. All Rights Reserved
 *
 * This source code is licensed under the Apache license.
 * See LICENSE file in the project root for license information.
 *
 * @file: [功能描述]
 *
 * @date: 2023/2/19 14:32:11
 * @author: 聂成阳(niechengyang@bytedance.com)
 */
import { Props } from 'shared/ReactTypes';
import { Container } from 'hostConfig';

// 在dom上保存节点的属性
export const elementPropsKey = '__props';
// 目前实现的事件类型
const validEventTypeList = ['click'];
type EventCallback = (e: Event) => void;

// 合成事件类型定义
interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}
// 收集路径上事件的回调接口
interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}

export interface DOMElement extends Element {
	[elementPropsKey]: Props;
}

// 将reactElement props 保存到 dom节点上，以便后续事件更新后使用
export function updateFiberProps(node: DOMElement, props: Props) {
	node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
	if (!validEventTypeList.includes(eventType)) {
		console.warn('当前不支持', eventType, '事件');
		return;
	}
	if (__DEV__) {
		console.log('初始化事件：', eventType);
	}
	container.addEventListener(eventType, (e) => {
		dispatchEvent(container, eventType, e);
	});
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
	const target = e.target as DOMElement;
	if (target === null) {
		console.warn('当前触发事件的dom不存在');
		return;
	}
	// 收集沿途的事件
	const { bubble, capture } = collectPaths(target, container, eventType);
	// 生成合成事件
	const se = createSyntheticEvent(e);
	// 执行事件
	triggerEventFlow(capture, se);
	if (!se.__stopPropagation) {
		triggerEventFlow(bubble, se);
	}
}

function collectPaths(
	targetElement: DOMElement,
	container: Container,
	eventType: string
) {
	const paths: Paths = {
		bubble: [],
		capture: []
	};
	while (targetElement && targetElement !== container) {
		const props = targetElement[elementPropsKey];
		if (props) {
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			if (callbackNameList) {
				callbackNameList.forEach((callbackName, i) => {
					const callbackEvent = props[callbackName];
					if (callbackEvent) {
						if (i === 0) {
							paths.capture.unshift(callbackEvent);
						} else {
							paths.bubble.push(callbackEvent);
						}
					}
				});
			}
		}
		targetElement = targetElement.parentNode as DOMElement;
	}
	return paths;
}

function getEventCallbackNameFromEventType(
	evetype: string
): string[] | undefined {
	return {
		click: ['onClickCapture', 'onClick']
	}[evetype];
}

function createSyntheticEvent(e: Event) {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = e.stopPropagation;
	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation.apply(e);
		}
	};
	return syntheticEvent;
}

// 执行事件回调
function triggerEventFlow(events: EventCallback[], se: SyntheticEvent) {
	for (const event of events) {
		event.call(null, se);
		if (se.__stopPropagation) {
			break;
		}
	}
}
