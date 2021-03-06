import React from "react";
import { FieldType, TallyField, TallySet } from "../models/DashboardModels";
import { safeBoolArr, safeNumArr } from "../utils/arrayUtils";
import { DefaultAxisMoveTimeoutMillis, EasyInputFormat } from "./HIDManager";

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
    buttonStates?: boolean[][];
    axisLastIncreaseTime?: number[][];
    axisLastDecreaseTime?: number[][];
    changeEffectClass?: string;
    useChangeEffect?: boolean;
}

const removeClass = (elementId: string) => () => {
    if ((window as any).RemoveClassByDocumentID){
        (window as any).RemoveClassByDocumentID(elementId);
        return;
    }
    const elm = window.document.getElementById(elementId);
    if (elm) {
        elm.removeAttribute("class");
    }
};
const clearTimeoutIfExist = (arr: number[][], i1: number, i2: number) => {
    if (arr[i1] === undefined) {
        arr[i1] = [];
    }
    const timeout = arr[i1][i2];
    if (timeout) {
        window.clearTimeout(timeout);
    }
};

var axisIncTimeouts: number[][] = [];
var axisDecTimeouts: number[][] = [];

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
    let activeTimeRemaining = 0;

    const withId: string =
        "TEMP_" + Math.round(Math.random() * 10000000000000000);

    if (props.tallyField.type === FieldType.button) {
        value = safeNumArr(props.allButtons, i1, i2);
        isActive = safeBoolArr(props.buttonStates, i1, i2);
    }
    if (props.tallyField.type === FieldType.axisUp) {
        value = safeNumArr(props.allAxisIncreases, i1, i2);
        activeTimeRemaining =
            DefaultAxisMoveTimeoutMillis -
            (Date.now() - safeNumArr(props.axisLastIncreaseTime, i1, i2));
        isActive = activeTimeRemaining > 0;
        clearTimeoutIfExist(axisIncTimeouts, i1, i2);
        axisIncTimeouts[i1][i2] = window.setTimeout(
            removeClass(withId),
            activeTimeRemaining,
        );
    }
    if (props.tallyField.type === FieldType.axisDown) {
        value = safeNumArr(props.allAxisDecreases, i1, i2);
        activeTimeRemaining =
            DefaultAxisMoveTimeoutMillis -
            (Date.now() - safeNumArr(props.axisLastDecreaseTime, i1, i2));
        isActive = activeTimeRemaining > 0;
    }
    if (props.tallyField.type === FieldType.axis) {
        if (props.allAxisIncreases[i1] && props.allAxisDecreases[i1]) {
            value =
                props.allAxisIncreases[i1][i2] + props.allAxisDecreases[i1][i2];
        }
    }

    if (activeTimeRemaining > 0) {
        clearTimeoutIfExist(axisDecTimeouts, i1, i2);
        axisDecTimeouts[i1][i2] = window.setTimeout(
            removeClass(withId),
            activeTimeRemaining,
        );
    }

    if (!!props.useChangeEffect && isActive) {
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
        return <div style={styleWithPosition}>{String(value)}</div>;
    }
};

export interface TallySetRendererProps {
    allButtons: number[][];
    allAxisIncreases: number[][];
    allAxisDecreases: number[][];
    parentStyle?: React.CSSProperties;
    tallySet: TallySet;
    buttonStates?: boolean[][];
    axisLastIncreaseTime?: number[][];
    axisLastDecreaseTime?: number[][];
    changeEffectClass?: string;
    useChangeEffect?: boolean;
}

export const TallySetRenderer = (props: TallySetRendererProps) => {
    const totalStyle = overrideStyle(props.tallySet.style, props.parentStyle);

    return (
        <>
            {props.tallySet.childSets?.map((childSet, i) => {
                return (
                    <TallySetRenderer
                        key={"set" + i}
                        allButtons={props.allButtons}
                        allAxisIncreases={props.allAxisIncreases}
                        allAxisDecreases={props.allAxisDecreases}
                        tallySet={childSet}
                        buttonStates={props.buttonStates}
                        axisLastIncreaseTime={props.axisLastIncreaseTime}
                        axisLastDecreaseTime={props.axisLastDecreaseTime}
                        parentStyle={totalStyle}
                        changeEffectClass={props.changeEffectClass}
                        useChangeEffect={props.useChangeEffect}
                    ></TallySetRenderer>
                );
            })}
            {props.tallySet.fields?.map((field, i) => {
                return (
                    <TallyFieldRenderer
                        key={"field" + i}
                        allButtons={props.allButtons}
                        allAxisIncreases={props.allAxisIncreases}
                        allAxisDecreases={props.allAxisDecreases}
                        tallyField={field}
                        buttonStates={props.buttonStates}
                        axisLastIncreaseTime={props.axisLastIncreaseTime}
                        axisLastDecreaseTime={props.axisLastDecreaseTime}
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
    buttonStates?: boolean[][];
    axisLastIncreaseTime?: number[][];
    axisLastDecreaseTime?: number[][];
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
                buttonStates={props.buttonStates}
                axisLastIncreaseTime={props.axisLastIncreaseTime}
                axisLastDecreaseTime={props.axisLastDecreaseTime}
                changeEffectClass={props.changeEffectClass}
                useChangeEffect={props.useChangeEffect}
            ></TallySetRenderer>
        </div>
    );
};
