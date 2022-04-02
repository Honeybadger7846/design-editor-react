import * as React from "react";
import useAppContext from "../../../../../hooks/useAppContext";
import Delete from "./components/Delete";
import Duplicate from "./components/Duplicate";
import Opacity from "./components/Opacity";
import UserLock from "../../Users/UserLock";
import Position from "./components/Position";
import Lock from "./components/Lock";

function Image() {
  const { setActiveSubMenu } = useAppContext();
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        height: "56px",
      }}
    >
      <div></div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <UserLock type="element" action="lock" admin={true} slot={<Lock />} />
        <UserLock type="element" action="position" slot={<Position />} />
        <UserLock type="element" action="opacity" slot={<Opacity />} />
        <UserLock type="element" action="duplicate" slot={<Duplicate />} />
        <UserLock type="element" action="delete" slot={<Delete />} />
      </div>
    </div>
  );
}

export default Image;
