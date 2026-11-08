'use client';
import {styled} from '@mui/material/styles';
import {calendarStyles, taskIdentityStyles, dialogIdentityStyles} from '../Calendar.styles';
import {CalendarSlots as Slots} from './slots';
export const CalendarRoot = styled('div', {name: 'TaskCalendar', slot: Slots.root})(calendarStyles[Slots.root]);
export const CalendarSidebar = styled('aside', {name: 'TaskCalendar', slot: Slots.sidebar})(calendarStyles[Slots.sidebar]);
export const CalendarMain = styled('main', {name: 'TaskCalendar', slot: Slots.main})(calendarStyles[Slots.main]);
export const TaskCard = styled('button', {name: 'TaskCalendar', slot: Slots.card, shouldForwardProp: prop => prop !== 'taskIndex' && prop !== 'dragHeight'})<{taskIndex: number; dragHeight?: number}>(calendarStyles[Slots.card], taskIdentityStyles, ({dragHeight}) => dragHeight === undefined ? {} : {'&&[data-drag-source=true]': {marginBottom: -dragHeight - 8}});
export const ScheduleDialog = styled('dialog', {name: 'TaskCalendar', slot: Slots.dialog, shouldForwardProp: prop => prop !== 'taskIndex'})<{taskIndex: number}>(calendarStyles[Slots.dialog], dialogIdentityStyles);

export const Placeholder = styled('div', {name: 'TaskCalendar', slot: Slots.placeholder, shouldForwardProp: prop => prop !== 'placeholderHeight'})<{placeholderHeight: number}>(calendarStyles[Slots.placeholder], ({placeholderHeight}) => ({height: placeholderHeight}));

export const PriorityCard = styled('li', {name: 'TaskCalendar', slot: Slots.priorityCard, shouldForwardProp: prop => prop !== 'taskIndex'})<{taskIndex: number}>(calendarStyles[Slots.priorityCard], taskIdentityStyles);
