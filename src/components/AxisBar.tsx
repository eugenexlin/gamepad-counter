import React from "react";
import { Axis } from "./HIDManager";

const outerBar: React.CSSProperties = {
	border: "solid 1px",
	width: "100%",
	textAlign: "center",
	borderColor: "#000",
	fontFamily: "monospace",
	height: "12px",
	position: "relative",
	margin: "2px"
}
const innerBar: React.CSSProperties = {
	textAlign: "center",
	fontFamily: "monospace",
	backgroundColor: "#F88",
	height: "10px",
}


export interface AxisBarProps {
    axis: Axis;
}

export const AxisBar = (props: AxisBarProps) => {
	const percent = Math.round((props.axis.value / props.axis.maxValue) * 10000)/100
    return (
        <>
            <div style={outerBar}>
				<div style={{...innerBar, width:percent + "%"}}>
				</div>
			</div>
        </>
    );
};
