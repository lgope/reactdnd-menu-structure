import { CSSProperties } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

import { TreeItem } from "./TreeItem";
import { iOS } from "../../utilities";

const animateLayoutChanges = ({ isSorting, wasDragging }) =>
  isSorting || wasDragging ? false : true;

export function SortableTreeItem({
  id,
  depth,
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
  onDragCancel,
  ...props
}) {
  // const {
  //   attributes,
  //   isDragging,
  //   isSorting,
  //   listeners,
  //   setDraggableNodeRef,
  //   setDroppableNodeRef,
  //   transform,
  //   transition,
  // } = useSortable({
  //   id,
  //   animateLayoutChanges,
  // });

  const style = {
    // transform: CSS.Translate.toString(transform),
    // transition,
  };

  return (
    <TreeItem
      // ref={setDraggableNodeRef}
      // wrapperRef={setDroppableNodeRef}
      id={id}
      style={style}
      depth={depth}
      // ghost={isDragging}
      disableSelection={iOS}
      // disableInteraction={isSorting}
      handleProps={
        {
          // ...attributes,
          // ...listeners,
        }
      }
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      {...props}
    />
  );
}
