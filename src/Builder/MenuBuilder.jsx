import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
  setProperty,
  getChildrens,
  arrayMove,
} from "./utilities";
import { SortableTreeItem } from "./components";

export function MenuBuilder({
  style = "bordered",
  items: itemsProps,
  setItems,
}) {
  const items = generateItemChildren(itemsProps);
  const indentationWidth = 50;
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const dragData = useRef({
    dragId: null,
    hoverId: null,
  });

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);

  let projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;

  const handleOnHover = (dragId, hoverId, deltaX) => {
    dragData.current = { ...dragData.current, hoverId };
    const { depth, parentId } = getProjection(
      flattenedItems,
      dragId,
      hoverId,
      deltaX,
      indentationWidth
    );

    projected = { depth, parentId };

    const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)));

    const overIndex = clonedItems.findIndex(({ id }) => id === hoverId);
    const activeIndex = clonedItems.findIndex(({ id }) => id === dragId);

    const activeTreeItem = clonedItems[activeIndex];
    clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

    const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
    const newItems = buildTree(sortedItems);

    setItems(newItems);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {flattenedItems.map(
        ({ id, children, depth, ...otherFields }, index) => (
          <SortableTreeItem
            key={id}
            id={id}
            items={items}
            treeItem={{ id, children, depth, ...otherFields, index }}
            index={index}
            otherfields={otherFields}
            depth={id === activeId && projected ? projected.depth : depth}
            indentationWidth={indentationWidth}
            indicator={style == "bordered"}
            childCount={getChildCount(items, activeId) + 1}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragHover={handleOnHover}
          />
        )
      )}
    </div>
  );

  function handleDragStart({ active: { id: aId } }) {
    if (activeId === aId || overId === aId) return;
    dragData.current = { dragId: aId, hoverId: aId };
    setActiveId(aId);
    setOverId(aId);
  }

  function handleDragOver(deltaX, id) {
    setOffsetLeft(deltaX);

    if (overId === id) return;
    setOverId(id ?? null);
  }

  // function handleDragMove(deltaX) {
  //   setOffsetLeft(deltaX);
  // }

  // function handleDragEnd(active, over) {
  function handleDragEnd() {
    const active = { id: activeId };
    const over = { id: overId };
    if (projected && over) {
      const { depth, parentId } = projected;

      const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)));

      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);

      const activeTreeItem = clonedItems[activeIndex];
      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      console.log(newItems);
      setItems(newItems);
    }

    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
  }
}

const generateItemChildren = (items) => {
  return items.map((item) => {
    return {
      ...item,
      children: item?.children ? generateItemChildren(item.children) : [],
    };
  });
};
