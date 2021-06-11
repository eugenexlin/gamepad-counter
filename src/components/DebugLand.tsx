import React from "react";
import _ from "lodash";
import {
    Box,
    FormControl,
    LinearProgress,
    Paper,
    TextField,
} from "@material-ui/core";
import { EasyInputFormat, Axis } from "../components/HIDManager";
import { ButtonList } from "../components/ButtonList";
import { AxisBar } from "../components/AxisBar";

export interface DebugLandProps {
    inputReports: EasyInputFormat[];
}

export const DebugLand = (props: DebugLandProps) => {
    return (
        <>
            {props.inputReports.map((inputReport, i) => {
                if (!inputReport) {
                    return <></>;
                }
                return (
                    <Box marginBottom={1} key={i}>
                        <FormControl fullWidth>
                            <Paper>
                                <Box margin={1}>
                                    <FormControl fullWidth>
                                        <TextField
                                            multiline={true}
                                            value={inputReport.deviceName}
                                        ></TextField>
                                    </FormControl>
                                </Box>
                                <Box margin={1}>
                                    <FormControl fullWidth>
                                        <TextField
                                            multiline={true}
                                            value={inputReport.rawData}
                                        ></TextField>
                                    </FormControl>
                                </Box>
                                <Box margin={1}>
                                    <ButtonList button={inputReport.button} />
                                </Box>
                                <Box margin={1}>
                                    {inputReport.axis.map((axis: Axis, i) => {
                                        return (
                                            <FormControl fullWidth key={i}>
                                                <AxisBar axis={axis} />
                                            </FormControl>
                                        );
                                    })}
                                </Box>
                            </Paper>
                        </FormControl>
                    </Box>
                );
            })}
        </>
    );
};
