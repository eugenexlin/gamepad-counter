import React from "react";
import _ from "lodash";

const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    borderRadius: "2px",
    border: "solid 1px",
    width: "90px",
    height: "30px",
    lineHeight: "30px",
    textAlign: "center",
    backgroundColor: "#FFFR",
    fontFamily: "monospace",
    margin: "2px 2px",
};
const axisContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
};

const axisStyleTop: React.CSSProperties = {
    borderRadius: "8px 8px 2px 2px",
    border: "solid 1px",
    width: "90px",
    height: "30px",
    lineHeight: "30px",
    textAlign: "center",
    backgroundColor: "#FFFR",
    fontFamily: "monospace",
    margin: "2px 2px",
};

const axisStyleBottom: React.CSSProperties = {
    borderRadius: "2px 2px 8px 8px",
    border: "solid 1px",
    width: "90px",
    height: "30px",
    lineHeight: "30px",
    textAlign: "center",
    backgroundColor: "#FFFR",
    fontFamily: "monospace",
    margin: "2px 2px",
};

export interface ButtonProps {
    index: number;
    tally?: number;
}
const Button = (props: ButtonProps) => {
    return <div style={buttonStyle}>{props.tally ? props.tally : 0}</div>;
};

interface ButtonTallyProps {
    button: number[];
}
const ButtonTally = (props: ButtonTallyProps) => {
    return (
        <div>
            {props.button.map((tally, i) => (
                <Button key={i + "_" + tally} index={i} tally={tally}></Button>
            ))}
        </div>
    );
};

export interface AxisProps {
    index: number;
    increaseTally?: number;
    decreaseTally?: number;
}
const Axis = (props: AxisProps) => {
    return (
        <span style={axisContainer}>
            <div style={axisStyleTop}>
                {props.increaseTally ? String(props.increaseTally) : 0}
            </div>
            <div style={axisStyleBottom}>
                {props.decreaseTally ? String(props.decreaseTally) : 0}
            </div>
        </span>
    );
};

interface AxisTallyProps {
    axisIncreases: number[];
    axisDecreases: number[];
}
const AxisTally = (props: AxisTallyProps) => {
    const maxLength = Math.max(
        props.axisIncreases.length,
        props.axisDecreases.length,
    );
    let items = [];
    for (let i = 0; i < maxLength; i++) {
        items.push(
            <Axis
                key={i}
                index={i}
                increaseTally={props.axisIncreases[i]}
                decreaseTally={props.axisDecreases[i]}
            ></Axis>,
        );
    }
    return <div style={{ display: "flex" }}>{items}</div>;
};

export interface AllButtonRendererProps {
    allButtons: number[][];
    allAxisIncreases: number[][];
    allAxisDecreases: number[][];
}

export const AllTallyRenderer = (props: AllButtonRendererProps) => {
    const maxLength = Math.max(
        props.allButtons.length,
        props.allAxisIncreases.length,
        props.allAxisDecreases.length,
    );
    let items = [];
    for (let i = 0; i < maxLength; i++) {
        const buttonArray = props.allButtons[i];
        const axisIncreaseArray = props.allAxisIncreases[i];
        const axisDecreaseArray = props.allAxisDecreases[i];
        items.push(
            <div key={i}>
                <ButtonTally button={buttonArray}></ButtonTally>
                <AxisTally
                    axisIncreases={axisIncreaseArray}
                    axisDecreases={axisDecreaseArray}
                ></AxisTally>
            </div>,
        );
    }
    return <>{items}</>;
};
