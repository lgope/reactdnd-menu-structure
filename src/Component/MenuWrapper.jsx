import { useMemo, useState } from "react";

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeChildrenOf,
  arrayMove,
  getPrevSiblingDeepChildCount,
} from "./utilities";

import CustomDragLayer from "./CustomDragLayer";
import { MenuItem } from "./Menu/MenuItem";

const MenuWrapper = ({ menus: menuData, setMenus }) => {
  const menuList = generateItemChildren(menuData);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const flattenedMenus = useMemo(() => {
    const flattenedTree = flattenTree(menuList);
    const collapsedItems = flattenedTree.reduce(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, menuList]);

  let projected =
    activeId && overId
      ? getProjection(flattenedMenus, activeId, overId, offsetLeft)
      : null;

  const handleOnHover = (dragId, hoverId, deltaX) => {
    const { depth, parentId } = getProjection(
      flattenedMenus,
      dragId,
      hoverId,
      deltaX
    );

    projected = { depth, parentId };

    const clonedItems = JSON.parse(JSON.stringify(flattenTree(menuList)));

    const overIndex = clonedItems.findIndex(({ id }) => id === hoverId);
    const activeIndex = clonedItems.findIndex(({ id }) => id === dragId);

    const activeTreeItem = clonedItems[activeIndex];
    clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

    const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
    const newItems = buildTree(sortedItems);

    setMenus(newItems);
  };

  const getBranchPathHeight = (menu) => {
    if (menu?.parentId) {
      const prevSiblingDeepChildCount = getPrevSiblingDeepChildCount(
        menuList,
        menu.id
      );

      return `${prevSiblingDeepChildCount * 50}px`;
    }

    return "0px";
  };

  return (
    <div className={`${classPrefix}-menu-wrapper`}>
      {flattenedMenus.map((menu, index) => (
        <MenuItem
          key={menu.id}
          id={menu.id}
          menu={menu}
          activeId={activeId}
          index={index}
          depth={
            menu.id === activeId && projected ? projected.depth : menu.depth
          }
          childCount={getChildCount(menuList, activeId) + 1}
          branchPathHeight={getBranchPathHeight(menu)}
          // Drag and Drop
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragHover={handleOnHover}
        />
      ))}

      <CustomDragLayer menuitems={menuList} />
    </div>
  );

  function handleDragStart({ active: { id: aId } }) {
    if (activeId === aId || overId === aId) return;
    setActiveId(aId);
    setOverId(aId);
  }

  function handleDragOver(deltaX, id) {
    setOffsetLeft(deltaX);

    if (overId === id) return;
    setOverId(id ?? null);
  }

  function handleDragEnd() {
    const active = { id: activeId };
    const over = { id: overId };
    if (projected && over) {
      const { depth, parentId } = projected;

      const clonedItems = JSON.parse(JSON.stringify(flattenTree(menuList)));

      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);

      const activeTreeItem = clonedItems[activeIndex];
      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setMenus(newItems);
    }

    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
  }
};

const generateItemChildren = (menuList) => {
  return menuList.map((menu) => {
    return {
      ...menu,
      children: menu?.children ? generateItemChildren(menu.children) : [],
    };
  });
};

export default MenuWrapper;
