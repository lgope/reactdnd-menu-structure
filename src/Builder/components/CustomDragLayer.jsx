import { useDragLayer } from "react-dnd";
import { SortableTreeItem } from "./TreeItem";
import { INDENTATION_WIDTH, getChildCount, getChildrens } from "../utilities";

const layerStyles = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

const getItemStyles = (initialOffset, currentOffset, depth) => {
  if (!initialOffset || !currentOffset) {
    return { display: "none" };
  }

  //   calculate the transform based on the difference between the initial position and the current position
  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
    WebkitTransform: transform,
    paddingLeft: `${INDENTATION_WIDTH * depth}px`,
  };
};

export const CustomDragLayer = ({ menuitems }) => {
  const { isDragging, item, initialOffset, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset, item.depth)}>
        <SortableTreeItem
          id={item.id}
          depth={item.depth}
          clone
          childCount={getChildCount(menuitems, item.id) + 1}
          value={item.id.toString()}
          otherfields={item}
          childs={getChildrens(menuitems, item.id)}
        />
      </div>
    </div>
  );
};
