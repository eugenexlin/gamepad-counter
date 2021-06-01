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
    onButtonDown?: (gamepadIndex: number, buttonIndex: number) => any;
    onButtonUp?: (gamepadIndex: number, buttonIndex: number) => any;
    onAxisChange?: (
        gamepadIndex: number,
        axisIndex: number,
        axisValue: number,
    ) => any;
}

export interface EasyInputFormat {
    axis: number[];
    button: boolean[];
}

const getBitFromUint8Array = (arr, offset) => {
    const index = Math.floor(offset / 8);
    const bitIndex = offset % 8;

    return getBitFromIndex(arr[index], bitIndex);
};

const getBitFromIndex = (num, index) => {
    const bit = 1 << index;
    const bitMask = num & bit;
    return bitMask >> index;
};

const parseInputReport = (event): EasyInputFormat => {
    let axis: number[] = [];
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

export const HIDManager = (props: HIDManagerProps) => {
    const [inputReports, setInputReports] = React.useState([]);
    const [easyInputReports, setEasyInputReports] = React.useState<
        EasyInputFormat[]
    >([]);
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
        console.info("device added:", device);
        printDeviceInfo(device);
        setRebindHandlerCounter(rebindHandlerCounter + 1);
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

            if (previousInputs[index] == buffer) return;

            // console.warn(event.device);

            previousInputs[index] = buffer;

            let newInputReports = _.cloneDeep(inputReports);
            newInputReports[index] = buffer;

            let neweasyInputReports = _.cloneDeep(easyInputReports);
            neweasyInputReports[index] = parseInputReport(event);

            setInputReports(newInputReports);
            setEasyInputReports(neweasyInputReports);
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
    }, [rebindHandlerCounter, inputReports]);

    return (
        <>
            <Grid container spacing={3}>
                <Grid container item xs={12} spacing={2}>
                    <Button
                        variant="contained"
                        onClick={(event) => {
                            connectDevice();
                        }}
                    >
                        Connect Device
                    </Button>
                </Grid>
                {inputReports.map((inputReport, i) => {
                    const easyInputReport = easyInputReports[i];
                    return (
                        <Grid container item xs={12} spacing={2} key={i}>
                            <FormControl fullWidth>
                                <Paper>
                                    <Box margin={1}>
                                        <FormControl fullWidth>
                                            <TextField
                                                multiline={true}
                                                value={inputReport}
                                            ></TextField>
                                        </FormControl>
                                    </Box>
                                    <Box margin={1}>
                                        {easyInputReport && (
                                            <ButtonList
                                                button={easyInputReport.button}
                                            />
                                        )}
                                    </Box>
                                </Paper>
                            </FormControl>
                        </Grid>
                    );
                })}
            </Grid>
        </>
    );
};
