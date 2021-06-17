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
    changeEffectClass?: string;
    useChangeEffect?: boolean;
}

//experimental feature outside of react so we can get some performance
var TallySetLayout_PreviousButtons: number[][] = [];
var TallySetLayout_PreviousAxisInc: number[][] = [];
var TallySetLayout_PreviousAxisDec: number[][] = [];

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

    if (TallySetLayout_PreviousButtons[i1] == undefined) {
        TallySetLayout_PreviousButtons[i1] = [];
        TallySetLayout_PreviousAxisInc[i1] = [];
        TallySetLayout_PreviousAxisDec[i1] = [];
    }

    let value = 0;
    let isDifferent = false;

    if (props.tallyField.type === FieldType.button) {
        if (props.allButtons[i1]) {
            value = props.allButtons[i1][i2];
            isDifferent = value !== TallySetLayout_PreviousButtons[i1][i2];
            TallySetLayout_PreviousButtons[i1][i2] = props.allButtons[i1][i2];
        }
    }
    if (props.tallyField.type === FieldType.axisUp) {
        if (props.allAxisIncreases[i1]) {
            value = props.allAxisIncreases[i1][i2];
            isDifferent = value !== TallySetLayout_PreviousAxisInc[i1][i2];
            TallySetLayout_PreviousAxisInc[i1][i2] =
                props.allAxisIncreases[i1][i2];
        }
    }
    if (props.tallyField.type === FieldType.axisDown) {
        if (props.allAxisDecreases[i1]) {
            value = props.allAxisDecreases[i1][i2];
            isDifferent = value !== TallySetLayout_PreviousAxisDec[i1][i2];
            TallySetLayout_PreviousAxisDec[i1][i2] =
                props.allAxisDecreases[i1][i2];
        }
    }
    if (props.tallyField.type === FieldType.axis) {
        if (props.allAxisIncreases[i1] && props.allAxisDecreases[i1]) {
            value =
                props.allAxisIncreases[i1][i2] + props.allAxisDecreases[i1][i2];
            isDifferent =
                value !==
                TallySetLayout_PreviousAxisInc[i1][i2] +
                    TallySetLayout_PreviousAxisDec[i1][i2];
            TallySetLayout_PreviousAxisInc[i1][i2] =
                props.allAxisIncreases[i1][i2];
            TallySetLayout_PreviousAxisDec[i1][i2] =
                props.allAxisDecreases[i1][i2];
        }
    }

    if (!!props.useChangeEffect && isDifferent) {
        const withId = "TEMP_" + Math.round(Math.random() * 10000000000000000);
        window.setTimeout(() => {}, 50);
        console.warn(i1, i2, withId, props.changeEffectClass);
        return (
            <div
                style={styleWithPosition}
                id={withId}
                className={props.changeEffectClass}
            >
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
                changeEffectClass={props.changeEffectClass}
                useChangeEffect={props.useChangeEffect}
            ></TallySetRenderer>
        </div>
    );
};
