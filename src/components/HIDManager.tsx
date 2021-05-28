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

let connectedDevices = [];
let selectedDevice = null;

export const HIDManager = (props: HIDManagerProps) => {
    const [inputInfo, setInputInfo] = React.useState("");

    const selectDevice = (device) => {
        if (selectedDevice) selectedDevice.oninputreport = null;

        if (!device) {
            selectedDevice = null;
        } else {
            console.info("connected ", device);
            selectedDevice = device;
        }

        if (selectedDevice) {
            selectedDevice.oninputreport = handleInputReport;
            if (!selectedDevice.opened) selectedDevice.open();
        }

        printDeviceInfo(device);
    };

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
            console.log("device already in connectedDevices");
            return;
        }
        connectedDevices.push(device);
        console.log("device connected: " + device.productName);
        if (selectedDevice === null) selectDevice(device);
    };

    const removeDevice = (device) => {
        if (device === selectedDevice) selectedDevice = null;
        for (let i = connectedDevices.length - 1; i >= 0; --i) {
            if (connectedDevices[i] === device) {
                connectedDevices.splice(i, 1);
                console.log("device disconnected: " + device.productName);
            }
        }
    };

    const handleInputReport = (event) => {
        let buffer = hex8(event.reportId);
        const reportData = new Uint8Array(event.data.buffer);
        for (let byte of reportData) buffer += " " + hex8(byte);
        setInputInfo(buffer);
    };

    React.useEffect(() => {
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
                <Grid container item xs={12} spacing={3}>
                    <FormControl fullWidth>
                        <TextField
                            multiline={true}
                            value={inputInfo}
                        ></TextField>
                    </FormControl>
                </Grid>
            </Grid>
        </>
    );
};
