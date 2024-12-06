import React, { forwardRef } from "react";
import classNames from "classnames";
import { useDrag, useDrop } from "react-dnd";

export const TreeItem = ({
  id,
  childCount,
  clone,
  depth,
  disableSelection,
  disableInteraction,
  ghost,
  handleProps,
  indentationWidth,
  indicator,
  style,
  value,
  updateitem,
  wrapperRef,
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
  onDragCancel,
  ...props
}) => {
  const dndRef = React.useRef(null);
  const item_type = "tree-item";
  const [{ isDragging }, dragRef] = useDrag({
    type: item_type,
    item: { type: item_type, id },
    collect: (monitor) => {
      const isDragging = monitor.isDragging();
      if (isDragging) {
        onDragStart({ active: { id } });
      }

      return { isDragging };
    },
    end: (item, monitor) => {
      const over = monitor.getDropResult();
      console.log({ over });
      // onDragEnd({ active: { id }, over });
    },
  });

  const [{ isCurrOver }, drop] = useDrop({
    accept: [item_type],
    drop: (item) => {
      // onDrop({ over: { id } });
      onDragEnd({ active: { id: item.id }, over: { id } });
    },

    hover: (item, monitor) => {
      const deltaX = monitor.getDifferenceFromInitialOffset().x;

      console.log({ deltaX });
      const isCurrOver = monitor.isOver({ shallow: true });

      if (isCurrOver) {
        onDragMove(deltaX);
        onDragOver({ over: { id } });
      }

      return { isCurrOver };
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  dragRef(drop(dndRef));

  return (
    <li
      className={classNames({
        Wrapper: true,
        clone: clone,
        ghost: isDragging,
        indicator: indicator,
        disableSelection: disableSelection,
        disableInteraction: disableInteraction,
      })}
      ref={wrapperRef}
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
        {...handleProps}
        className="TreeItem"
        ref={dndRef}
        style={{
          ...style,
          height:
            ghost && indicator && childCount
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
