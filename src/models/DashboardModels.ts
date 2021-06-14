
export enum FieldType {
    button = "BUTTON",
    axis = "AXIS",
    axisUp = "AXIS_INCREASE",
    axisDown = "AXIS_DECREASE",
}

export interface TallyField {
    deviceIndex: number;
    fieldTypeIndex: number;
	type: FieldType;
    posX: number;
    posY: number;
    style?: React.CSSProperties;
}

// all this does is override the style for all fields underneath
export interface TallySet {
    fields?: TallyField[];
    childSets?: TallySet[];
    style?: React.CSSProperties;
}
