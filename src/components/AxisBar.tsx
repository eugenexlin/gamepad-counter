import React from "react";
import { Axis } from "./HIDManager";

const outerBar: React.CSSProperties = {
    border: "solid 1px",
    width: "100%",
    textAlign: "center",
    borderColor: "#000",
    fontFamily: "monospace",
    height: "14px",
    position: "relative",
    margin: "2px",
};
const innerBar: React.CSSProperties = {
    textAlign: "center",
    fontFamily: "monospace",
    backgroundColor: "#F88",
    height: "12px",
};
const floatingNumber: React.CSSProperties = {
    position: "absolute",
	top: "0",
	left: "0",
	lineHeight: "12px",
};

export interface AxisBarProps {
    axis: Axis;
}

export const AxisBar = (props: AxisBarProps) => {
    const percent =
        Math.round((props.axis.value / props.axis.maxValue) * 10000) / 100;
    return (
        <>
            <div style={outerBar}>
                <div style={floatingNumber}>{String(props.axis.value)}</div>
                <div style={{ ...innerBar, width: percent + "%" }}></div>
            </div>
        </>
    );
};
