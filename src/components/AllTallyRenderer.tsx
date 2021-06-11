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

export interface ButtonProps {
    index: number;
    tally: number;
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
                <Button key={i} index={i} tally={tally}></Button>
            ))}
        </div>
    );
};

export interface AllButtonRendererProps {
    allButtons: number[][];
}

export const AllTallyRenderer = (props: AllButtonRendererProps) => {
    return (
        <>
            {props.allButtons.map((buttonArray, i) => (
                <ButtonTally key={i} button={buttonArray}></ButtonTally>
            ))}
        </>
    );
};
