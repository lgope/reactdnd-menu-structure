import React, { useEffect, useRef } from "react";
import classNames from "classnames";
import { useDrag, useDrop } from "react-dnd";
import {
  INDENTATION_WIDTH,
  ITEM_TYPE,
  getPrevSiblingDeepChildCount,
} from "../utilities";
import { getEmptyImage } from "react-dnd-html5-backend";

export const TreeItem = ({
  id,
  childCount,
  treeItem,
  items,
  index,
  clone,
  depth,
  disableInteraction,
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
    accept: [ITEM_TYPE],
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
        onDragHover(item.id, treeItem.id, deltaX);
      }
    },
  });

  const [{ isDragging }, setDraggableNodeRef, setPreviewRef] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      return { type: ITEM_TYPE, id, depth, index, ...treeItem };
    },
    collect: (monitor) => {
      const isDragging = monitor.isDragging();
      if (isDragging) {
        onDragStart({ active: { id: treeItem.id } });
      }

      return { isDragging };
    },
  });

  useEffect(() => {
    setPreviewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

  setDraggableNodeRef(setDroppableNodeRef(dndRef));

  const getBranchPathHeight = () => {
    if (treeItem?.parentId) {
      const prevSiblingDeepChildCount = getPrevSiblingDeepChildCount(
        items,
        treeItem.id
      );

      return `${prevSiblingDeepChildCount * 50}px`;
    }

    return "0px";
  };

  const branchPathHeight = getBranchPathHeight();

  return (
    <li
      ref={dndRef}
      data-handler-id={handlerId}
      data-depth={depth}
      className={classNames({
        Wrapper: true,
        dragging: isDragging,
        indicator: indicator,
        disableInteraction: disableInteraction,
      })}
      style={{
        ...(!clone
          ? {
              paddingLeft: `${INDENTATION_WIDTH * depth}px`,
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
        <span
          className="navigation-item-path"
          style={{
            height: branchPathHeight,
            display: treeItem?.parentId ? "block" : "none",
          }}
        ></span>
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

        {clone && childCount && childCount > 1 ? (
          <div className={"Count"}>
            {props.childs &&
              props.childs.map((child) => {
                return (
                  <RecursiveItem child={child} key={child.id} nDepth={1} />
                );
              })}
          </div>
        ) : null}
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
