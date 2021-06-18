import React from "react";
import _ from "lodash";

import { hex8, printDeviceInfo } from "../utils/HIDUtils";
import {
    Button,
    Grid,
    GridList,
    GridListTile,
    TextField,
    FormControl,
    Paper,
    Card,
    CardContent,
    CardActions,
    Box,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

// uses code by nondebug
// https://github.com/nondebug/webhid-explorer

// this class just lets you handle hid inputs in a react way

// i could not figure a good way to implement it to convert it to react lifecycle
// so it is kind of sloppy
// HID fires events outside react livecycle so it is faster than react lifecycle can handle

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            overflow: "visible",
        },
        tile: {},
        fixedBottomLeft: {
            position: "absolute",
            bottom: 0,
            left: 0,
        },
        card: {
            margin: "2px",
            height: "95%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        },
    }),
);

export interface HIDManagerProps {
    onInputReport?: (
        connectedHIDIndex: number,
        inputReport: EasyInputFormat,
    ) => any;
    onButtonDown?: (gamepadIndex: number, buttonIndex: number) => any;
    onButtonUp?: (gamepadIndex: number, buttonIndex: number) => any;
    onAxisStartIncreasing?: (gamepadIndex: number, axisIndex: number) => any;
    onAxisStartDecreasing?: (gamepadIndex: number, axisIndex: number) => any;
    onAxisKeepIncreasing?: (gamepadIndex: number, axisIndex: number) => any;
    onAxisKeepDecreasing?: (gamepadIndex: number, axisIndex: number) => any;
    onAxisChange?: (
        gamepadIndex: number,
        axisIndex: number,
        axisValue: number,
    ) => any;
    onDeviceRemoved?: (index: number) => any;

    // so we need the manager to appear everywhere, but
    IsRenderUI?: boolean;

    // i think a common behavior is if joystick sensor flickers between 2 values.
    // so i will add specific detection for when joystick bounces between 2 values extremely quickly
    IsDisableAxisJitterFilter?: boolean;

    // how much to buffer axis events
    AxisBufferMillis?: number;
    // how much you must move axis so it activates
    AxisMoveMin?: number;
    // how many ms until moving in the same direction would trigger again
    AxisMoveTimeoutMillis?: number;
}
const DefaultAxisBufferMillis = 100;
const DefaultAxisMoveMin = 2;
export const DefaultAxisMoveTimeoutMillis = 200;

export interface EasyInputFormat {
    deviceName: string;
    rawData: string;
    axis: Axis[]; // normalize to [-1.0, 1.0]
    button: boolean[];
}
export interface Axis {
    value: number;
    maxValue: number;
}

const getBitFromUint8Array = (arr, offset) => {
    const index = Math.floor(offset / 8);
    const bitIndex = offset % 8;

    return getBitFromIndex(arr[index], bitIndex);
};
const getValueFromUint8Array = (arr, offset, size) => {
    const index = Math.floor(offset / 8);
    const units = size / 8;
    let total = 0;
    // it seems like joystick 16 bit will be reversed endian, so we loop high index to low
    for (let i = units - 1; i >= 0; i--) {
        total = total << 8;
        total = total + arr[index + i];
    }

    return total;
};

const getBitFromIndex = (num, index) => {
    const bit = 1 << index;
    const bitMask = num & bit;
    return bitMask >> index;
};

const parseInputReport = (event) => {
    let axis: Axis[] = [];
    let button: boolean[] = [];

    const reportData = new Uint8Array(event.data.buffer);
    // only support 1 input report now

    // lets fetch the buttons 1 bit at a time. wow hard coded object heirarchy yay
    const inputReports = event.device.collections[0].inputReports[0].items;

    let offset = 0;
    for (let ri = 0; ri < inputReports.length; ri++) {
        const inputReport = inputReports[ri];
        // assume report count > 1 means button
        if (inputReport.reportCount > 1) {
            for (let i = 0; i < inputReport.reportCount; i++) {
                const b = getBitFromUint8Array(reportData, offset + i);
                button.push(!!b);
            }
        } else {
            if (inputReport.isLinear && !inputReport.isRange) {
                const size = inputReport.reportSize;

                const axisMax = 1 << size;
                const axisValue = getValueFromUint8Array(
                    reportData,
                    offset,
                    size,
                );

                axis.push({
                    maxValue: axisMax,
                    value: axisValue,
                });
            }
        }
        offset = offset + inputReport.reportCount * inputReport.reportSize;
    }

    return {
        axis,
        button,
    };
};

// react is in a different world than normal js
// and there is a problem with the handler not getting the accurate value
// MAYBE because the handler function doesnt have the
var connectedDevices = [];

var previousInputs: EasyInputFormat[] = [];
// joy index, axis index
var previousPreviousAxis: Axis[][] = [];
// the value which the axis began rest.
var axisSettledValue: number[][] = [];
// -1 or +1
var axisMoveDirection: number[][] = [];
// time millies
var axisLastMoveTime: number[][] = [];
var axisLastMoveProcTime: number[][] = [];
var axisBufferLastProcTime: number = Date.now();

const renderDisconnectButton = (classes, removeDevice) => {
    return (
        <GridList cols={6} cellHeight={120}>
            {connectedDevices.map((device, index) => (
                <GridListTile
                    className={classes.tile}
                    key={device.productName + index}
                    cols={1}
                >
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography
                                variant="body1"
                                color="textPrimary"
                                component="p"
                            >
                                Connect Slot {index}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="textSecondary"
                                component="p"
                            >
                                {device.productName}
                            </Typography>
                        </CardContent>
                        <CardActions className={classes.fixedBottomLeft}>
                            <Button
                                size="small"
                                onClick={() => {
                                    removeDevice(device);
                                }}
                            >
                                Remove
                            </Button>
                        </CardActions>
                    </Card>
                </GridListTile>
            ))}
        </GridList>
    );
};
const HasButtonPresses = (input: EasyInputFormat, index: number) => {
    const prev = previousInputs[index];
    // if button length change i guess panic and just let it through
    if (prev.button.length !== input.button.length) {
        return true;
    } else {
        for (let i = 0; i < prev.button.length; i++) {
            if (prev.button[i] !== input.button[i]) {
                return true;
            }
        }
    }
};
const IsDupeOrNoise = (
    input: EasyInputFormat,
    index: number,
    IsDisableAxisJitterFilter?: boolean,
): boolean => {
    const prev = previousInputs[index];

    // if no previous input send it
    if (!prev) {
        return false;
    }

    // if button length change i guess panic and just let it through
    if (HasButtonPresses(input, index)) {
        return false;
    }

    if (prev.axis.length !== input.axis.length) {
        return false;
    } else {
        // now check if any axis is different
        for (let i = 0; i < prev.axis.length; i++) {
            if (prev.axis[i].value !== input.axis[i].value) {
                //if we should filter joystick jitter, do extra logic on the exact same index
                if (!IsDisableAxisJitterFilter) {
                    if (!previousPreviousAxis[index]) {
                        return false;
                    }

                    if (
                        previousPreviousAxis[index].length !== input.axis.length
                    ) {
                        return false;
                    } else {
                        // now check if any axis is different
                        for (let i = 0; i < prev.axis.length; i++) {
                            if (
                                previousPreviousAxis[index][i].value !==
                                input.axis[i].value
                            ) {
                                return false;
                            }
                        }
                    }
                } else {
                    // no jitter filter, do instantly
                    return false;
                }
            }
        }
    }

    return true;
};

const processAxisEvents = (
    input: EasyInputFormat,
    index: number,
    props: HIDManagerProps,
) => {
    const nowMS = Date.now();

    // default the values if they dont exist
    if (axisSettledValue[index] == undefined) {
        // i think for the very first frame this value is actually NaN.. great
        axisSettledValue[index] = input.axis.map((a: Axis) => a.value);
    }
    if (axisMoveDirection[index] == undefined) {
        axisMoveDirection[index] = Array(input.axis.length).fill(0);
    }
    if (axisLastMoveTime[index] == undefined) {
        axisLastMoveTime[index] = Array(input.axis.length).fill(nowMS);
    }
    if (axisLastMoveProcTime[index] == undefined) {
        axisLastMoveProcTime[index] = Array(input.axis.length).fill(nowMS);
    }

    const AxisMoveMin = props.AxisMoveMin
        ? props.AxisMoveMin
        : DefaultAxisMoveMin;
    const AxisMoveTimeoutMillis = props.AxisMoveTimeoutMillis
        ? props.AxisMoveTimeoutMillis
        : DefaultAxisMoveTimeoutMillis;

    // check for movement
    for (let i = 0; i < input.axis.length; i++) {
        if (isNaN(axisSettledValue[index][i])) {
            axisSettledValue[index][i] = input.axis[i].value;
        }
        let velocity = input.axis[i].value - axisSettledValue[index][i];

        if (velocity !== 0) {
            // compensate the velocity if it traveled basically > 98% of the max value..
            // we will assume it is because it wrapped around
            if (velocity > input.axis[i].maxValue * 0.98) {
                velocity = velocity - input.axis[i].maxValue;
            }
            if (velocity < -(input.axis[i].maxValue * 0.98)) {
                velocity = velocity + input.axis[i].maxValue;
            }

            const velocityDirection = velocity / Math.abs(velocity);
            const velocityMagnitude = velocity / velocityDirection;

            if (axisMoveDirection[index][i] !== velocityDirection) {
                // move in different direction so count if we are moving more than the min move
                if (velocityMagnitude >= AxisMoveMin) {
                    if (velocityDirection > 0) {
                        if (props.onAxisStartIncreasing) {
                            props.onAxisStartIncreasing(index, i);
                        }
                    } else {
                        if (props.onAxisStartDecreasing) {
                            props.onAxisStartDecreasing(index, i);
                        }
                    }
                    axisSettledValue[index][i] = input.axis[index][i];
                    axisMoveDirection[index][i] = velocityDirection;
                    axisLastMoveTime[index][i] = nowMS;
                } else {
                    // do nothing.. it is within dead zone.
                }
            } else {
                // move in same direction

                if (
                    nowMS - axisLastMoveTime[index][i] >=
                    AxisMoveTimeoutMillis
                ) {
                    // if the last time was longer than timeout, then it will trigger
                    // check if threshold met
                    if (velocityMagnitude >= AxisMoveMin) {
                        if (velocityDirection > 0) {
                            if (props.onAxisStartIncreasing) {
                                props.onAxisStartIncreasing(index, i);
                            }
                        } else {
                            if (props.onAxisStartDecreasing) {
                                props.onAxisStartDecreasing(index, i);
                            }
                        }
                        axisSettledValue[index][i] = input.axis[index][i];
                        axisMoveDirection[index][i] = velocityDirection;
                        axisLastMoveTime[index][i] = nowMS;
                    } else {
                        // do nothing.. it is within dead zone.
                    }
                } else {
                    // if same direction, just keep updating vthe current settled value and last update time
                    axisSettledValue[index][i] = input.axis[index][i];
                    axisLastMoveTime[index][i] = nowMS;

                    if (
                        Math.abs(nowMS - axisLastMoveProcTime[index][i]) > 100
                    ) {
                        axisLastMoveProcTime[index][i] = nowMS;
                        if (velocityDirection > 0) {
                            if (props.onAxisKeepIncreasing) {
                                props.onAxisKeepIncreasing(index, i);
                            }
                        } else {
                            if (props.onAxisKeepDecreasing) {
                                props.onAxisKeepDecreasing(index, i);
                            }
                        }
                    }
                }
            }
        }
    }
};

export const HIDManager = (props: HIDManagerProps) => {
    const classes = useStyles();

    const [fatalErrorMessage, setFatalErrorMessage] = React.useState("");

    const connectDevice = () => {
        (window.navigator as any).hid
            .requestDevice({ filters: [] })
            .then((devices) => {
                if (devices.length == 0) return;

                for (let device of devices) addDevice(device);
            });
    };

    const addDevice = (device) => {
        if (connectedDevices.includes(device)) {
            console.info("device already in connectedDevices");
            return;
        }
        // use a simple array expansion
        if (!device.opened) device.open();
        connectedDevices.push(device);

        device.oninputreport = handleInputReport;
        console.info("device added:", device);
        printDeviceInfo(device);
        handleInitialInputReport(device);
    };

    const removeDevice = (device) => {
        device.oninputreport = null;
        const index = connectedDevices.indexOf(device);
        if (index >= 0) {
            connectedDevices.splice(index, 1);
            if (props.onDeviceRemoved) {
                props.onDeviceRemoved(index);
            }
        }
    };

    // hacky way of parsing the initial device so we know how many buttons we will have
    const handleInitialInputReport = (device) => {
        const event = {
            data: {
                buffer: new Uint16Array(),
            },
            device: device,
        };
        return handleInputReport(event);
    };

    const handleInputReport = (event) => {
        const index = connectedDevices.indexOf(event.device);

        if (index >= 0) {
            let buffer = "";
            const reportData = new Uint8Array(event.data.buffer);
            for (const byte of reportData) buffer += " " + hex8(byte);

            const parsed = parseInputReport(event);

            let result: EasyInputFormat = {
                deviceName: event.device.productName,
                rawData: buffer,
                axis: parsed.axis,
                button: parsed.button,
            };

            // here specifically we test for dupe input particularly jiggly joystick
            if (IsDupeOrNoise(result, index, props.IsDisableAxisJitterFilter)) {
                return;
            }

            // convert event to button press event if button press event is specified
            for (let i = 0; i < result.button.length; i++) {
                if (result.button[i]) {
                    if (
                        !previousInputs[index] ||
                        !previousInputs[index].button[i]
                    ) {
                        if (props.onButtonDown) {
                            props.onButtonDown(index, i);
                        }
                    }
                } else {
                    if (
                        previousInputs[index] &&
                        previousInputs[index].button[i]
                    ) {
                        if (props.onButtonUp) {
                            props.onButtonUp(index, i);
                        }
                    }
                }
            }

            // process axis movements
            processAxisEvents(result, index, props);

            previousInputs[index] = result;

            const AxisBufferMillis = props.AxisBufferMillis
                ? props.AxisBufferMillis
                : DefaultAxisBufferMillis;

            const isAxisReady =
                Math.abs(axisBufferLastProcTime - Date.now()) >
                AxisBufferMillis;
            const HasButton = HasButtonPresses(result, index);
            const shouldFireEvent = HasButton || isAxisReady;
            if (isAxisReady) {
                axisBufferLastProcTime = Date.now();
            }
            if (shouldFireEvent) {
                if (props.onInputReport) {
                    props.onInputReport(index, result);
                }
            }
        }
    };

    // this effect to update the handler for all the devices that live outside of react
    React.useEffect(() => {
        const nav = window.navigator as any;

        if (nav.hid === undefined) {
            setFatalErrorMessage(
                "window.navigator.hid is undefined. Does your browser have certain permissions disabled?",
            );
        } else {
            nav.hid.onconnect = (e) => {
                addDevice(e.device);
            };
            nav.hid.ondisconnect = (e) => {
                removeDevice(e.device);
            };
        }

        return () => {};
    }, []);

    connectedDevices.forEach((device) => {
        device.oninputreport = handleInputReport;
    });

    const isRender: boolean =
        props.IsRenderUI === undefined ? true : !!props.IsRenderUI;

    if (isRender) {
        return (
            <Grid container className={classes.root} spacing={2}>
                <Grid item xs={12}>
                    {fatalErrorMessage !== "" && (
                        <div style={{ color: "#F00" }}>
                            FATAL ERROR: {fatalErrorMessage}
                        </div>
                    )}

                    <Button
                        variant="contained"
                        onClick={(event) => {
                            connectDevice();
                        }}
                        disabled={fatalErrorMessage !== ""}
                    >
                        Connect Device
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    {renderDisconnectButton(classes, removeDevice)}
                </Grid>
            </Grid>
        );
    } else {
        return null;
    }
};
