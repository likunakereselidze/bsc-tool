'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableRow({
  id,
  trStyle,
  trClassName,
  children,
}: {
  id: string;
  trStyle?: React.CSSProperties;
  trClassName?: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 0,
    ...trStyle,
  };

  return (
    <tr ref={setNodeRef} style={style} className={trClassName}>
      <td
        style={{ width: 28, textAlign: 'center', cursor: 'grab', color: '#d1d5db', userSelect: 'none', verticalAlign: 'middle' }}
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⠿
      </td>
      {children}
    </tr>
  );
}

export function SortableObjectiveGroup({
  objectiveIds,
  onDragEnd,
  children,
}: {
  objectiveIds: string[];
  onDragEnd: (activeId: string, overId: string) => void;
  children: React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onDragEnd(String(active.id), String(over.id));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={objectiveIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
