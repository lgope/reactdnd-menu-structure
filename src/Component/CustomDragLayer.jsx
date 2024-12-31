import { useDragLayer } from "react-dnd";
import { INDENTATION_WIDTH, getChildCount, getChildrens } from "./utilities";
import { MenuItem } from "./Menu/MenuItem";

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

const CustomDragLayer = ({ menuitems }) => {
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
        <MenuItem
          id={item.id}
          depth={item.depth}
          clone
          childCount={getChildCount(menuitems, item.id) + 1}
          menu={item}
          childs={getChildrens(menuitems, item.id)}
        />
      </div>
    </div>
  );
};

export default CustomDragLayer;
