/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPanel, EuiToolTip } from '@elastic/eui';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';

import { BrowserFields } from '../../containers/source';
import { DetailItem, ToStringArray } from '../../graphql/types';
import { WithCopyToClipboard } from '../../lib/clipboard/with_copy_to_clipboard';
import { DragEffects } from '../drag_and_drop/draggable_wrapper';
import { DroppableWrapper } from '../drag_and_drop/droppable_wrapper';
import { DRAG_TYPE_FIELD, getDraggableFieldId, getDroppableId } from '../drag_and_drop/helpers';
import { DefaultDraggable } from '../draggables';
import { DraggableFieldBadge } from '../draggables/field_badge';
import { FieldName } from '../fields_browser/field_name';
import { SelectableText } from '../selectable_text';
import { FormattedFieldValue } from '../timeline/body/renderers/formatted_field';
import { OnUpdateColumns } from '../timeline/events';
import { WithHoverActions } from '../with_hover_actions';

import { getColumnsWithTimestamp, getExampleText, getIconFromType } from './helpers';
import * as i18n from './translations';

const HoverActionsContainer = styled(EuiPanel)`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 25px;
  justify-content: center;
  left: 5px;
  position: absolute;
  top: -10px;
  width: 30px;
`;

const FieldTypeIcon = styled(EuiIcon)`
  position: relative;
  top: -2px;
`;

export const getColumns = ({
  browserFields,
  eventId,
  isLoading,
  onUpdateColumns,
  timelineId,
}: {
  browserFields: BrowserFields;
  eventId: string;
  isLoading: boolean;
  onUpdateColumns: OnUpdateColumns;
  timelineId: string;
}) => [
  {
    field: 'type',
    name: '',
    sortable: false,
    truncateText: false,
    width: '30px',
    render: (type: string) => (
      <EuiToolTip content={type}>
        <FieldTypeIcon data-test-subj="field-type-icon" type={getIconFromType(type)} />
      </EuiToolTip>
    ),
  },
  {
    field: 'field',
    name: i18n.FIELD,
    sortable: true,
    truncateText: false,
    render: (field: string, data: DetailItem) => (
      <DroppableWrapper
        droppableId={getDroppableId(`event-details-${data.category}-${field}-${timelineId}`)}
        key={`${data.category}-${field}-${timelineId}`}
        isDropDisabled={true}
        type={DRAG_TYPE_FIELD}
      >
        <Draggable
          draggableId={getDraggableFieldId({
            contextId: `field-browser-category-${data.category}-field-${field}-${timelineId}`,
            fieldId: field,
          })}
          index={0}
          type={DRAG_TYPE_FIELD}
        >
          {(provided, snapshot) => (
            <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
              {!snapshot.isDragging ? (
                <FieldName
                  categoryId={data.category}
                  categoryColumns={getColumnsWithTimestamp({
                    browserFields,
                    category: data.category,
                  })}
                  data-test-subj="field-name"
                  fieldId={field}
                  isLoading={isLoading}
                  onUpdateColumns={onUpdateColumns}
                />
              ) : (
                <DragEffects>
                  <DraggableFieldBadge fieldId={field} />
                </DragEffects>
              )}
            </div>
          )}
        </Draggable>
      </DroppableWrapper>
    ),
  },
  {
    field: 'values',
    name: i18n.VALUE,
    sortable: true,
    truncateText: false,
    render: (values: ToStringArray | null | undefined, data: DetailItem) => (
      <EuiFlexGroup direction="column" alignItems="flexStart" component="span" gutterSize="none">
        {values != null &&
          values.map((value, i) => (
            <EuiFlexItem
              grow={false}
              component="span"
              key={`${eventId}-${data.field}-${i}-${value}`}
            >
              <WithHoverActions
                hoverContent={
                  <HoverActionsContainer data-test-subj="hover-actions-container">
                    <EuiToolTip content={i18n.COPY_TO_CLIPBOARD}>
                      <WithCopyToClipboard text={value} titleSummary={i18n.VALUE.toLowerCase()} />
                    </EuiToolTip>
                  </HoverActionsContainer>
                }
                render={() => (
                  <DefaultDraggable
                    data-test-subj="ip"
                    field={data.field}
                    id={`event-details-field-value-${eventId}-${data.field}-${i}-${value}`}
                    tooltipContent={data.field}
                    value={value}
                  >
                    <FormattedFieldValue
                      contextId={'event-details-field-value'}
                      eventId={eventId}
                      fieldName={data.field}
                      fieldType={data.type}
                      value={value}
                    />
                  </DefaultDraggable>
                )}
              />
            </EuiFlexItem>
          ))}
      </EuiFlexGroup>
    ),
  },
  {
    field: 'description',
    name: i18n.DESCRIPTION,
    render: (description: string | null | undefined, data: DetailItem) => (
      <SelectableText>{`${description || ''} ${getExampleText(data.example)}`}</SelectableText>
    ),
    sortable: true,
    truncateText: true,
    width: '50%',
  },
  {
    field: 'valuesConcatenated',
    sortable: false,
    truncateText: true,
    render: () => null,
    width: '1px',
  },
];
