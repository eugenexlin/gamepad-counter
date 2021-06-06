import React from "react";
import _ from "lodash";
import {
    Box,
    FormControl,
    LinearProgress,
    Paper,
    TextField,
} from "@material-ui/core";
import { HIDManager, EasyInputFormat, Axis } from "../components/HIDManager";
import { ButtonList } from "../components/ButtonList";
import { AxisBar } from "../components/AxisBar";

export const DebugLand = () => {
    const [inputReports, setInputReports] = React.useState<EasyInputFormat[]>(
        [],
    );

    const handleRemoveReport = (index: number) => {
        if (index >= 0 && inputReports.length > index) {
            const array = [...inputReports];
            array.splice(index, 1);
            setInputReports(array);
        }
    };
    const handleInputReport = (index: number, report: EasyInputFormat) => {
        let newInputReports = inputReports.slice();
        newInputReports[index] = report;
        setInputReports(newInputReports);
    };

    return (
        <>
            <Box marginBottom={1}>
                <HIDManager
                    onInputReport={handleInputReport}
                    onDeviceRemoved={handleRemoveReport}
                ></HIDManager>
            </Box>
            {inputReports.map((inputReport, i) => {
                if (!inputReport) {
                    return <></>;
                }
                return (
                    <Box marginBottom={1}>
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
                                            <FormControl fullWidth>
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
