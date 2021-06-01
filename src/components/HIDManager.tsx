import React from "react";
import _ from "lodash";

import { hex8, printDeviceInfo } from "../utils/HIDUtils";
import {
    Button,
    Grid,
    TextField,
    FormControl,
    Paper,
    Box,
} from "@material-ui/core";
import { ButtonList } from "./ButtonList";

// uses code by nondebug
// https://github.com/nondebug/webhid-explorer

// this class just lets you handle hid inputs in a react way

export interface HIDManagerProps {
    onInputReport: (
        connectedHIDIndex: number,
        inputReport: EasyInputFormat,
    ) => any;
    onButtonDown?: (gamepadIndex: number, buttonIndex: number) => any;
    onButtonUp?: (gamepadIndex: number, buttonIndex: number) => any;
    onAxisChange?: (
        gamepadIndex: number,
        axisIndex: number,
        axisValue: number,
    ) => any;
}

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
    const units = size / 8
    let total = 0;
    // it seems like joystick 16 bit will be reversed endian, so we loop high index to low
    for (let i = units - 1; i >= 0; i--){
        total = total << 8
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

                const axisMax = (1 << size)
                const axisValue = getValueFromUint8Array(reportData, offset, size);

                axis.push({
                    maxValue: axisMax,
                    value: axisValue,
                })
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
var previousInputs = [];
var previous2Axis = [];


const checkDupeOrNoise = (input: EasyInputFormat): boolean => {
    // if buttons are different sent it through no matter what


    return false;
}

export const HIDManager = (props: HIDManagerProps) => {
    const [rebindHandlerCounter, setRebindHandlerCounter] = React.useState(0);

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
    };

    const removeDevice = (device) => {
        device.oninputreport = null;
        const index = connectedDevices.indexOf(device);
        if (index >= 0) {
            connectedDevices.splice(index, 1);
        }
    };

    const handleInputReport = (event) => {
        const index = connectedDevices.indexOf(event.device);

        if (index >= 0) {
            let buffer = "";
            const reportData = new Uint8Array(event.data.buffer);
            for (const byte of reportData) buffer += " " + hex8(byte);

            if (previousInputs[index] == buffer) {
                return;
            }

            const parsed = parseInputReport(event);

            let result: EasyInputFormat = {
                deviceName: event.device.productName,
                rawData: buffer,
                axis: parsed.axis,
                button: parsed.button,
            };

            // here specifically we test for dupe input particularly jiggly joystick
            if (checkDupeOrNoise(result)) {
                return;
            }

            previousInputs[index] = buffer;

            if (props.onInputReport) {
                props.onInputReport(index, result);
            }
            setRebindHandlerCounter(rebindHandlerCounter + 1);
        }
    };

    // this effect to update the handler for all the devices that live outside of react
    React.useEffect(() => {
        const nav = window.navigator as any;
        nav.hid.onconnect = (e) => {
            addDevice(e.device);
        };
        nav.hid.ondisconnect = (e) => {
            removeDevice(e.device);
        };

        return () => {};
    }, []);

    React.useEffect(() => {
        // reregister the handlers on all connected devices whenbever a dependency changes
        // this is the hack that needs to be done to bridge non react with react and having "state" or handlers outside of react.
        connectedDevices.forEach((device) => {
            device.oninputreport = handleInputReport;
        });
    }, [rebindHandlerCounter]);

    return (
        <>
            <Box>
                <Button
                    variant="contained"
                    onClick={(event) => {
                        connectDevice();
                    }}
                >
                    Connect Device
                </Button>
            </Box>
        </>
    );
};
