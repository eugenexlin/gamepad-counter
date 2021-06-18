import { FieldType, TallySet } from "./DashboardModels";

export const BUTTON_WIDTH: number = 120;
export const BUTTON_HEIGHT: number = 32;

export const OFFSET_V: number = 0;
export const OFFSET: number = 16;

export const DENPA_BASE_THEME: React.CSSProperties = {
    height: BUTTON_HEIGHT - 2 + "px",
    width: BUTTON_WIDTH - 2 + "px",
    fontSize: "22px",
    textAlign: "center",
    fontFamily: "roboto, Calibri, sans-serif",
    border: "solid",
    borderWidth: "2px",
    lineHeight: BUTTON_HEIGHT - 6 + "px",
    transition: "border-color ease 0.3s, color ease 0.3s"
};
export const IIDX_BUTTON_STYLE: React.CSSProperties = {
    color: "#BBB",
    borderColor: "#BBB",
};
export const IIDX_BUTTON_BLACK_STYLE: React.CSSProperties = {
    color: "#AAF",
    borderColor: "#AAF",
};
export const IIDX_PLATE_UP_STYLE: React.CSSProperties = {
    color: "#999",
    borderColor: "#999",
    borderRadius: "16px 16px 0px 0px",
};
export const IIDX_PLATE_DOWN_STYLE: React.CSSProperties = {
    color: "#999",
    borderColor: "#999",
    borderRadius: "0px 0px 16px 16px",
};

export const INFINITAS_DP: TallySet = {
    childSets: [
        {
            fields: [
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 0,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH * 1,
                    posY: BUTTON_HEIGHT,
                },
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 2,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH * 2,
                    posY: BUTTON_HEIGHT,
                },
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 4,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH * 3,
                    posY: BUTTON_HEIGHT,
                },
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 6,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH * 4,
                    posY: BUTTON_HEIGHT,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 0,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH * 0,
                    posY: OFFSET_V + BUTTON_HEIGHT * 3,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 2,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH * 1,
                    posY: OFFSET_V + BUTTON_HEIGHT * 3,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 4,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH * 2,
                    posY: OFFSET_V + BUTTON_HEIGHT * 3,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 6,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH * 3,
                    posY: OFFSET_V + BUTTON_HEIGHT * 3,
                },
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 8,
                    type: FieldType.button,
                    posX: OFFSET + BUTTON_WIDTH * 5,
                    posY: OFFSET_V + BUTTON_HEIGHT * 0,
                },
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 9,
                    type: FieldType.button,
                    posX: OFFSET + BUTTON_WIDTH * 5,
                    posY: OFFSET_V + BUTTON_HEIGHT * 1,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 10,
                    type: FieldType.button,
                    posX: OFFSET + BUTTON_WIDTH * 5,
                    posY: OFFSET_V + BUTTON_HEIGHT * 2,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 11,
                    type: FieldType.button,
                    posX: OFFSET + BUTTON_WIDTH * 5,
                    posY: OFFSET_V + BUTTON_HEIGHT * 3,
                },
            ],
            style: IIDX_BUTTON_STYLE,
        },
        {
            fields: [
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 1,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH / 2 + BUTTON_WIDTH * 1,
                    posY: 0,
                },
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 3,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH / 2 + BUTTON_WIDTH * 2,
                    posY: 0,
                },
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 5,
                    type: FieldType.button,
                    posX: BUTTON_WIDTH / 2 + BUTTON_WIDTH * 3,
                    posY: 0,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 1,
                    type: FieldType.button,
                    posX: OFFSET + BUTTON_WIDTH / 2 + BUTTON_WIDTH * 0,
                    posY: OFFSET_V + BUTTON_HEIGHT * 2,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 3,
                    type: FieldType.button,
                    posX: OFFSET + BUTTON_WIDTH / 2 + BUTTON_WIDTH * 1,
                    posY: OFFSET_V + BUTTON_HEIGHT * 2,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 5,
                    type: FieldType.button,
                    posX: OFFSET + BUTTON_WIDTH / 2 + BUTTON_WIDTH * 2,
                    posY: OFFSET_V + BUTTON_HEIGHT * 2,
                },
            ],
            style: IIDX_BUTTON_BLACK_STYLE,
        },
        {
            fields: [
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 0,
                    type: FieldType.axisUp,
                    posX: 0,
                    posY: 0,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 0,
                    type: FieldType.axisDown,
                    posX: BUTTON_WIDTH * 4,
                    posY: OFFSET_V + BUTTON_HEIGHT * 2,
                },
            ],
            style: IIDX_PLATE_UP_STYLE,
        },
        {
            fields: [
                {
                    deviceIndex: 0,
                    fieldTypeIndex: 0,
                    type: FieldType.axisDown,
                    posX: 0,
                    posY: BUTTON_HEIGHT,
                },
                {
                    deviceIndex: 1,
                    fieldTypeIndex: 0,
                    type: FieldType.axisUp,
                    posX: BUTTON_WIDTH * 4,
                    posY: OFFSET_V + BUTTON_HEIGHT * 3,
                },
            ],
            style: IIDX_PLATE_DOWN_STYLE,
        },
    ],
    style: DENPA_BASE_THEME,
};
