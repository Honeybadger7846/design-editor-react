import * as React from "react";
import Icons from "../../icons";
import { Button, SHAPE, KIND, SIZE } from "baseui/button";
import useAppContext from "../../../../../hooks/useAppContext";
import { SubMenuType } from "../../../../../constants/editor";
import Delete from "./components/Delete";
import Duplicate from "./components/Duplicate";
import Opacity from "./components/Opacity";
import Position from "./components/Position";
import Lock from "./components/Lock";
import UserLock from "../../Users/UserLock";
function Elements() {
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
      <UserLock
        action="fill"
        slot={
          <Button
            onClick={() => setActiveSubMenu(SubMenuType.COLOR)}
            size={SIZE.compact}
            kind={KIND.tertiary}
            shape={SHAPE.square}
          >
            <Icons.FillColor size={24} color="#000000" />
          </Button>
        }
      />
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

export default Elements;
