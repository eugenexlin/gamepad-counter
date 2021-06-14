import React from "react";
import { FieldType, TallyField, TallySet } from "../models/DashboardModels";

const overrideStyle = (
    base: React.CSSProperties,
    override: React.CSSProperties,
) => {
    return { ...base, ...override };
};

interface TallyFieldRendererProps {
    allButtons: number[][];
    allAxisIncreases: number[][];
    allAxisDecreases: number[][];
    parentStyle?: React.CSSProperties;
    tallyField: TallyField;
}
const TallyFieldRenderer = (props: TallyFieldRendererProps) => {
    const style = overrideStyle(props.tallyField.style, props.parentStyle);
    const styleWithPosition: React.CSSProperties = {
        ...style,
        position: "absolute",
        top: props.tallyField.posY + "px",
        left: props.tallyField.posX + "px",
    };
    let value = 0;
    if (props.tallyField.type === FieldType.button) {
        if (props.allButtons[props.tallyField.deviceIndex]) {
            value =
                props.allButtons[props.tallyField.deviceIndex][
                    props.tallyField.fieldTypeIndex
                ];
        }
    }
    if (props.tallyField.type === FieldType.axisUp) {
        if (props.allAxisIncreases[props.tallyField.deviceIndex]) {
            value =
                props.allAxisIncreases[props.tallyField.deviceIndex][
                    props.tallyField.fieldTypeIndex
                ];
        }
    }
    if (props.tallyField.type === FieldType.axisDown) {
        if (props.allAxisDecreases[props.tallyField.deviceIndex]) {
            value =
                props.allAxisDecreases[props.tallyField.deviceIndex][
                    props.tallyField.fieldTypeIndex
                ];
        }
    }
    if (props.tallyField.type === FieldType.axis) {
        if (
            props.allAxisIncreases[props.tallyField.deviceIndex] &&
            props.allAxisDecreases[props.tallyField.deviceIndex]
        ) {
            value =
                props.allAxisIncreases[props.tallyField.deviceIndex][
                    props.tallyField.fieldTypeIndex
                ] +
                props.allAxisDecreases[props.tallyField.deviceIndex][
                    props.tallyField.fieldTypeIndex
                ];
        }
    }

    return <div style={styleWithPosition}>{value}</div>;
};

export interface TallySetRendererProps {
    allButtons: number[][];
    allAxisIncreases: number[][];
    allAxisDecreases: number[][];
    parentStyle?: React.CSSProperties;
    tallySet: TallySet;
}

export const TallySetRenderer = (props: TallySetRendererProps) => {
    const totalStyle = overrideStyle(props.tallySet.style, props.parentStyle);

    return (
        <>
            {props.tallySet.childSets?.map((childSet) => {
                return (
                    <TallySetRenderer
                        allButtons={props.allButtons}
                        allAxisIncreases={props.allAxisIncreases}
                        allAxisDecreases={props.allAxisDecreases}
                        tallySet={childSet}
                        parentStyle={totalStyle}
                    ></TallySetRenderer>
                );
            })}
            {props.tallySet.fields?.map((field) => {
                return (
                    <TallyFieldRenderer
                        allButtons={props.allButtons}
                        allAxisIncreases={props.allAxisIncreases}
                        allAxisDecreases={props.allAxisDecreases}
                        tallyField={field}
                        parentStyle={totalStyle}
                    ></TallyFieldRenderer>
                );
            })}
        </>
    );
};

export interface TallySetLayoutProps {
    allButtons: number[][];
    allAxisIncreases: number[][];
    allAxisDecreases: number[][];
    tallySet: TallySet;
}

export const TallySetLayout = (props: TallySetLayoutProps) => {
    return (
        <div style={{ position: "relative" }}>
            <TallySetRenderer
                allButtons={props.allButtons}
                allAxisIncreases={props.allAxisIncreases}
                allAxisDecreases={props.allAxisDecreases}
                tallySet={props.tallySet}
            ></TallySetRenderer>
        </div>
    );
};
