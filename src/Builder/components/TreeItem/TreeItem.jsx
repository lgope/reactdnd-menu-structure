import React, { forwardRef, useRef } from "react";
import classNames from "classnames";
import { useDrag, useDrop } from "react-dnd";
import { getChildCount, getChildrens, getProjection } from "../../utilities";
const item_type = "tree-item";

export const TreeItem = ({
  id,
  childCount,
  treeItem,
  // flattenedItems,
  items,
  index,
  clone,
  depth,
  disableInteraction,
  indentationWidth,
  indicator,
  style,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragHover,
  ...props
}) => {
  const dndRef = useRef(null);

  const [{ handlerId }, setDroppableNodeRef] = useDrop({
    accept: [item_type],
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    drop: (item) => {
      onDragEnd({ id: item.id }, { id: treeItem.id });
    },

    hover: (item, monitor) => {
      if (!dndRef.current) {
        return;
      }

      const deltaX = monitor.getDifferenceFromInitialOffset().x;
      onDragOver(deltaX, treeItem.id);

      if (monitor.isOver({ shallow: true }) && item.id !== treeItem.id) {
        console.log("hovering");
        onDragHover(item.id, treeItem.id, deltaX);
      }
    },
  });

  const [{ isDragging }, setDraggableNodeRef] = useDrag({
    type: item_type,
    item: () => {
      return { type: item_type, id, depth, index, ...treeItem };
    },
    collect: (monitor) => {
      const isDragging = monitor.isDragging();
      if (isDragging) {
        onDragStart({ active: { id: treeItem.id } });
      }

      return { isDragging };
    },
  });

  const renderChildOnDraging = () => {
    const childs = getChildrens(items, treeItem.id);
    const childCount = getChildCount(items, treeItem.id) + 1;

    return (
      <div className={"Count"}>
        {childs &&
          childs.map((child) => {
            return <RecursiveItem child={child} key={child.id} nDepth={1} />;
          })}
      </div>
    );
  };

  setDraggableNodeRef(setDroppableNodeRef(dndRef));

  return (
    <li
      ref={dndRef}
      data-handler-id={handlerId}
      className={classNames({
        Wrapper: true,
        dragging: isDragging,
        indicator: indicator,
        disableInteraction: disableInteraction,
      })}
      style={{
        ...(!clone
          ? {
              paddingLeft: `${indentationWidth * depth}px`,
            }
          : {}),
      }}
      {...props}
    >
      <div
        className="TreeItem"
        style={{
          ...style,
          height:
            isDragging && indicator && childCount
              ? `${childCount * 42 + (childCount - 1) * 9}px`
              : "42px",
        }}
      >
        <span className={"Text"}>
          {props?.otherfields?.name}{" "}
          <span
            style={{
              fontSize: "13px",
              fontWeight: "400",
              fontStyle: "italic",
              color: "#50575e",
              marginLeft: "4px",
            }}
          >
            {depth > 0 ? "sub item" : ""}
          </span>
        </span>

        {isDragging ? renderChildOnDraging() : null}
      </div>
    </li>
  );
};

const RecursiveItem = (props) => {
  const newDepth = props.nDepth + 1;
  return (
    <>
      <div
        style={{
          width: "414px",
          height: "42px",
          border: "1px solid #dcdcde",
          marginTop: "9px",
          marginLeft: `${props.nDepth * 50}px`,
          backgroundColor: "#f6f7f7",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          paddingLeft: "0.5rem",
          fontWeight: "600",
          fontSize: "13px",
        }}
      >
        {props.child.name}{" "}
        <span
          style={{
            fontSize: "13px",
            fontWeight: "400",
            fontStyle: "italic",
            color: "#50575e",
            marginLeft: "4px",
          }}
        >
          sub item
        </span>
      </div>
      {props.child.children.map((child) => {
        return <RecursiveItem key={child.id} child={child} nDepth={newDepth} />;
      })}
    </>
  );
};
