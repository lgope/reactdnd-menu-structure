import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
  setProperty,
  getChildrens,
} from "./utilities";
import { SortableTreeItem } from "./components";

const arrayMove = (array, from, to) => {};

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

  function updateItem(id, data, items) {
    const newItems = [];

    for (const item of items) {
      if (item.id === id) {
        item.id = data.id;
        item.name = data.name;
        item.href = data.href;
      }

      if (item?.children?.length) {
        item.children = updateItem(id, data, item.children);
      }

      newItems.push(item);
    }

    return newItems;
  }

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

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;

  const sensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );
  
  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {flattenedItems.map(
        ({ id, children, collapsed, depth, ...otherFields }) => (
          <SortableTreeItem
            key={id}
            id={id}
            updateitem={(id, data) => {
              console.log("updateitem", id, data);
              setItems((items) => updateItem(id, data, items));
            }}
            value={id}
            otherfields={otherFields}
            depth={id === activeId && projected ? projected.depth : depth}
            indentationWidth={indentationWidth}
            indicator={style == "bordered"}
            childCount={getChildCount(items, activeId) + 1}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            onRemove={() => handleRemove(id)}
          />
        )
      )}
    </div>
  );

  function handleDragStart({ active: { id: aId } }) {
    if (activeId === aId || overId === aId) return;
    setActiveId(aId);
    setOverId(aId);
  }

  function handleDragMove(deltaX) {
    setOffsetLeft(deltaX);
  }

  function handleDragOver({ over }) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems = JSON.parse(JSON.stringify(flattenTree(items)));
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    // setCurrentPosition(null);

    document.body.style.setProperty("cursor", "");
  }

  function handleRemove(id) {
    setItems((items) => removeItem(items, id));
  }
}

const adjustTranslate = ({ transform }) => {
  return {
    ...transform,
  };
};

const generateItemChildren = (items) => {
  return items.map((item) => {
    return {
      ...item,
      children: item?.children ? generateItemChildren(item.children) : [],
    };
  });
};
