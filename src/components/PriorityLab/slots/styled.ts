'use client';
import {styled} from '@mui/material/styles';
import {laboratoryStyles} from '../PriorityLab.styles';
import {PriorityLabSlots as Slots} from './slots';

export const PriorityLabRoot = styled('div', {name: 'PriorityLab', slot: Slots.root})(laboratoryStyles);
