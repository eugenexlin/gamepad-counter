import React from "react";

const buttonStyle: React.CSSProperties = {
	display: "inline-block",
	borderRadius: "100px",
	border: "solid 1px",
	width: "32px",
	height: "32px",
	lineHeight: "32px",
	textAlign: "center",
	backgroundColor: "#FFFR",
}
const pressedButtonStyle: React.CSSProperties = {
	display: "inline-block",
	borderRadius: "100px",
	border: "solid 1px",
	width: "32px",
	height: "32px",
	lineHeight: "32px",
	textAlign: "center",
	backgroundColor: "#FAA",
}

export interface ButtonProps {
	index: number;
	isPressed: boolean;
}

const Button = (props: ButtonProps) => {
	return <div style={props.isPressed ? pressedButtonStyle : buttonStyle}>
		{props.index}
	</div>
}

export interface ButtonListProps {
	button: boolean[];
}

export const ButtonList = (props) => {
	return props.button.map((isPressed, i) => <Button index={i} isPressed={isPressed} key={i + "_" + isPressed}></Button>)
}


