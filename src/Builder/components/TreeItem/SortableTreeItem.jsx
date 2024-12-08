import { TreeItem } from "./TreeItem";

export function SortableTreeItem({
  id,
  treeItem,
  depth,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragHover,
  ...props
}) {
  return (
    <TreeItem
      id={id}
      depth={depth}
      treeItem={treeItem}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragHover={onDragHover}
      {...props}
    />
  );
}
