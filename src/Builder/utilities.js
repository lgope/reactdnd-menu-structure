import cloneDeep from "lodash/cloneDeep";
import update from "immutability-helper";

// export function arrayMove(array, from, to) {
//   const newArray = array.slice();
//   newArray.splice(
//     to < 0 ? newArray.length + to : to,
//     0,
//     newArray.splice(from, 1)[0]
//   );

//   return newArray;
// }

// export const arrayMove = (prevArray, dragIndex, dropIndex) => {
//   if (dragIndex === dropIndex) return prevArray;
//   let temp_arr = cloneDeep(prevArray);
//   if (dragIndex > dropIndex) {
//     let temp = temp_arr[dragIndex];
//     prevArray.splice(dragIndex, 1);
//     prevArray.splice(dropIndex, 0, temp);
//   } else {
//     prevArray.splice(dropIndex + 1, 0, temp_arr[dragIndex]);
//     prevArray.splice(dragIndex, 1);
//   }
//   return prevArray;
// };

export const INDENTATION_WIDTH = 50;

/**
 *
 * @param {*} array
 * @param {*} from
 * @param {*} to
 * @returns
 *
 * Example:
 * const array = ['a', 'b', 'c', 'd', 'e'];
 * console.log(arrayMove(array, -1, 1)); // ['a', 'e', 'b', 'c', 'd']
 */

export const arrayMove = (array, from, to) => {
  const length = array.length;
  const fromIndex = ((from % length) + length) % length;
  const toIndex = ((to % length) + length) % length;

  return update(array, {
    $splice: [
      [fromIndex, 1],
      [toIndex, 0, array[fromIndex]],
    ],
  });
};

function getDragDepth(offset) {
  return Math.round(offset / INDENTATION_WIDTH);
}

export function getProjection(items, activeId, overId, dragOffset) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);

  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);

  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];

  const dragDepth = getDragDepth(dragOffset, INDENTATION_WIDTH);

  const projectedDepth = activeItem.depth + dragDepth;

  const maxDepth = getMaxDepth({
    previousItem,
  });

  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

function getMaxDepth({ previousItem }) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({ nextItem }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function flatten(items, parentId, depth = 0) {
  return items.reduce((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flatten(item.children, item.id, depth + 1),
    ];
  }, []);
}

export function flattenTree(items) {
  return flatten(items);
}

export function buildTree(flattenedItems) {
  const root = { id: "root", children: [], name: "root" };
  const nodes = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children, name } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, children, name };
    parent.children.push(item);
  }

  return root.children;
}

export function findItem(items, itemId) {
  return items.find(({ id }) => id === itemId);
}

export function findItemDeep(items, itemId) {
  for (const item of items) {
    const { id, children } = item;

    if (id === itemId) {
      return item;
    }

    if (children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}

export function removeItem(items, id) {
  const newItems = [];

  for (const item of items) {
    if (item.id === id) {
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}

export function setProperty(items, id, property, setter) {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

function countChildren(items, count = 0) {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

export function getChildCount(items, id) {
  const item = findItemDeep(items, id);

  return item ? countChildren(item.children) : 0;
}

export function getChildrens(items, id) {
  const item = findItemDeep(items, id);

  return item ? item.children : [];
}

export function removeChildrenOf(items, ids) {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
}
