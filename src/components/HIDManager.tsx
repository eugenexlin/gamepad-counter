import React from "react";
import _ from "lodash";

import { hex8, printDeviceInfo } from "../utils/HIDUtils";
import { Button, Grid, TextField, FormControl } from "@material-ui/core";

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

// react is in a different world than normal js
// and there is a problem with the handler not getting the accurate value
// MAYBE because the handler function doesnt have the
var connectedDevices = [];
var previousInputs = [];

export const HIDManager = (props: HIDManagerProps) => {
    const [inputReports, setInputReports] = React.useState([]);

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
        device.oninputreport = handleInputReport;
        if (!device.opened) device.open();
        connectedDevices.push(device);
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
            let buffer = hex8(event.reportId);
            const reportData = new Uint8Array(event.data.buffer);
            for (let byte of reportData) buffer += " " + hex8(byte);

            if (previousInputs[index] == buffer) return;

            console.warn(buffer);

            previousInputs[index] =buffer
            let newInputReports = _.cloneDeep(previousInputs);
            newInputReports[index] = buffer;
            setInputReports(newInputReports);
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

    return (
        <>
            <Grid container spacing={3}>
                <Grid container item xs={12} spacing={3}>
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
                    return (
                        <Grid container item xs={12} spacing={3} key={i}>
                            <FormControl fullWidth>
                                <TextField
                                    multiline={true}
                                    value={inputReport}
                                ></TextField>
                            </FormControl>
                        </Grid>
                    );
                })}
            </Grid>
        </>
    );
};
