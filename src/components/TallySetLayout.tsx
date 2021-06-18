import React from "react";
import { FieldType, TallyField, TallySet } from "../models/DashboardModels";
import { EasyInputFormat } from "./HIDManager";

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
    inputReports?: EasyInputFormat[];
    buttonStates?: boolean[][];
    changeEffectClass?: string;
    useChangeEffect?: boolean;
}

const TallyFieldRenderer = (props: TallyFieldRendererProps) => {
    const style = overrideStyle(props.tallyField.style, props.parentStyle);
    const styleWithPosition: React.CSSProperties = {
        ...style,
        position: "absolute",
        top: props.tallyField.posY + "px",
        left: props.tallyField.posX + "px",
    };
    const i1 = props.tallyField.deviceIndex;
    const i2 = props.tallyField.fieldTypeIndex;

    let value = 0;
    let isActive = false;

    if (props.tallyField.type === FieldType.button) {
        if (props.allButtons[i1]) {
            value = props.allButtons[i1][i2];
            isActive = props.buttonStates[i1] && props.buttonStates[i1][i2];
        }
    }
    if (props.tallyField.type === FieldType.axisUp) {
        if (props.allAxisIncreases[i1]) {
            value = props.allAxisIncreases[i1][i2];
        }
    }
    if (props.tallyField.type === FieldType.axisDown) {
        if (props.allAxisDecreases[i1]) {
            value = props.allAxisDecreases[i1][i2];
        }
    }
    if (props.tallyField.type === FieldType.axis) {
        if (props.allAxisIncreases[i1] && props.allAxisDecreases[i1]) {
            value =
                props.allAxisIncreases[i1][i2] + props.allAxisDecreases[i1][i2];
        }
    }

    if (!!props.useChangeEffect && isActive) {
        return (
            <div style={styleWithPosition} className={props.changeEffectClass}>
                {value}
            </div>
        );
    } else {
        return <div style={styleWithPosition}>{value}</div>;
    }
};

export interface TallySetRendererProps {
    allButtons: number[][];
    allAxisIncreases: number[][];
    allAxisDecreases: number[][];
    parentStyle?: React.CSSProperties;
    tallySet: TallySet;
    inputReports?: EasyInputFormat[];
    buttonStates?: boolean[][];
    changeEffectClass?: string;
    useChangeEffect?: boolean;
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
                        inputReports={props.inputReports}
                        buttonStates={props.buttonStates}
                        parentStyle={totalStyle}
                        changeEffectClass={props.changeEffectClass}
                        useChangeEffect={props.useChangeEffect}
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
                        inputReports={props.inputReports}
                        buttonStates={props.buttonStates}
                        parentStyle={totalStyle}
                        changeEffectClass={props.changeEffectClass}
                        useChangeEffect={props.useChangeEffect}
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
    inputReports?: EasyInputFormat[];
    buttonStates?: boolean[][];
    changeEffectClass?: string;
    useChangeEffect?: boolean;
}

export const TallySetLayout = (props: TallySetLayoutProps) => {
    return (
        <div style={{ position: "relative" }}>
            <TallySetRenderer
                allButtons={props.allButtons}
                allAxisIncreases={props.allAxisIncreases}
                allAxisDecreases={props.allAxisDecreases}
                tallySet={props.tallySet}
                inputReports={props.inputReports}
                buttonStates={props.buttonStates}
                changeEffectClass={props.changeEffectClass}
                useChangeEffect={props.useChangeEffect}
            ></TallySetRenderer>
        </div>
    );
};
